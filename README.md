# The Lightning Inspector


## Key Differences from the Aura Inspector

* devtools.js specifies "Lightning" vs "Aura" as the tab name.
* manifest.json uses "Lightning" vs "Aura"
* manifest.json had it's key removed, that should not be specified in production mode.
* manifest.json has a different version specified.

All of these changes have already been made in this repository. 

## Updating the Lightning Inspector for the next version


### Update Repository

* Check out the aura/lightning-inspector repository from git.soma.salesforce.com
* Check out a new branch
* Pull the upstream repository which is aura/aura
* Ensure the above changes in "Key Differences" list are not overwritten.
* Commit your branch
* Send a pull request for your branch. 
** You should be able to accept the pull request yourself, if not contact the repository admin.

### Update Google Chrome Dev Extension