#!/usr/bin/env python

import sys
import re
import os
import subprocess
import shlex
import urllib2

verbose = False

INVALID_BRANCHES = ["master", "develop"]
REMOTE_NAME = "origin"  # the name of the remote central repository
GOLD_BRANCH = "master"  # the blessed development branch that precheckin will eventually commit to
JENKINS_URL = "jenkins.auraframework.org"
JENKINS_JOB = "aura_precheckin"
JENKINS_TOKEN = "panda"

def main():
    git = Git()

    # get the current branch and validate it is a feature branch
    current_branch = git.get_current_branch()
    
    if (current_branch in INVALID_BRANCHES):
        die("ERROR.\nYou shouldn't be working directly on branch '%s'.\nPlease create a feature branch and try again.")

    # get latest commits from origin
    fetch_results = git.fetch(REMOTE_NAME)

    # rebase feature branch with latest commits
    rebase_results = git.rebase("%s/%s" % (REMOTE_NAME, GOLD_BRANCH))
    #TODO: handle rebase conflicts--maybe look at the popen.returncode?

    # create a temporary branch based on the latest commit
    temp_branch_name = "pre-%s" % git.get_sha1("HEAD")
    git.new_branch(temp_branch_name)
    
    # push the temporary branch to the remote
    # TODO: is this really necessary?  Can we just get Jenkins to pull from us locally?
    git.push(REMOTE_NAME, temp_branch_name)

    # poke Jenkins to kickoff a precheckin
    base_url = "http://%s/job/%s/" % (JENKINS_URL, JENKINS_JOB)
    poke_url = "%sbuildWithParameters?token=%s&temp_branch_name=%s" % (base_url, JENKINS_TOKEN, temp_branch_name)
    urllib2.urlopen(poke_url)
    
    print "Precheckin initiated.  Check progress at %s" % base_url

def die(msg):
    if verbose:
        raise Exception(msg)
    else:
        sys.stderr.write(msg + "\n")
        sys.exit(1)

def write_pipe(c, str):
    if verbose:
        sys.stderr.write('Writing pipe: %s\n' % c)

    pipe = os.popen(c, 'w')
    val = pipe.write(str)
    if pipe.close():
        die('Command failed: %s' % c)

    return val

def read_write_pipe(c,  str,  ignore_error=False):
    if verbose:
        sys.stderr.write('Writing/Reading pipe: %s\n' % c)

    popen = run_command(c, stdin=subprocess.PIPE, stdout=subprocess.PIPE)
    val = popen.communicate(str)[0]
    if popen.returncode and not ignore_error:
        die('Command failed: %s' % c)

    return val

def read_pipe(c, ignore_error=False):
    if verbose:
        sys.stderr.write('Reading pipe: %s\n' % c)

    if ignore_error:
        popen = run_command(c, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    else:
        popen = run_command(c, stdout=subprocess.PIPE)
    val = popen.communicate()[0]
    if popen.returncode and not ignore_error:
        die('Command failed: %s' % c)

    return val

def run_command(command_str, **kw):
    stdout = kw.get('stdout')

    kw['stdout'] = subprocess.PIPE
    
    # split along the pipes
    commands = [shlex.split(command.strip()) for command in command_str.split("|")]
    for command in commands[:-1]:
        p = subprocess.Popen(command, **kw)
        kw['stdin'] = p.stdout

    kw['stdout'] = stdout

    return subprocess.Popen(commands[-1], **kw)

def read_command(command):
    return read_pipe(command).strip()

class Git:
    """ Static class for Git commands.

        This is not intended to be a full Python API for Git.
        These are just-fleshed-out-enough for our needs.
    """

    def get_current_branch(self):
        return read_command("git branch --no-color | grep '^\* ' | grep -v 'no branch' | sed 's/^* //g'")

    def get_local_branches(self):
        return read_command("git branch --no-color | sed 's/^[* ] //'")

    def get_remote_branches(self):
        return read_command("git branch -r --no-color | sed 's/^[* ] //'")

    def get_all_branches(self):
        return "%s\n%s" % (self.get_local_branches(), self.get_remote_branches)

    def fetch(self, remote="origin", branch=""):
        # TODO: fetch writes to stderr, so we gotta read from there if we want the results in Python and not on the console
        # for now, just shut it up with -q
        return read_command("git fetch -q %s %s" % (remote, branch))

    def push(self, remote="origin", branch=""):
        return read_command("git push %s %s:refs/heads/%s" % (remote, branch, branch))

    def rebase(self, branch):
        return read_command("git rebase %s" % branch)

    def new_branch(self, branch_name, checkout=True):
        if branch_name in self.get_all_branches().split("\n"):
            die("ERROR.\nCannot create branch '%s' -- it already exists." % branch_name)

        if checkout:
            return read_command("git checkout -b %s" % branch_name)
        else:
            return read_command("git branch %s" % branch_name)

    def get_sha1(self, treeish, abbrev=True):
        return read_command("git rev-parse %s%s" % (abbrev and "--short " or "", treeish))

if __name__ == "__main__":
    main()
