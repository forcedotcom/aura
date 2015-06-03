<?xml version="1.0"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:xslt="http://xml.apache.org/xslt" version="1.0">
  <xsl:output method="xml" version="1.0" encoding="UTF-8" indent="yes" omit-xml-declaration="no" xslt:indent-amount="8" />
  <xsl:strip-space elements="*" />
  <xsl:param name="jstestPrefix" select="'ComponentJSTestSuite.'"/>
  <xsl:template match="node()|@*">
    <xsl:copy>
      <xsl:apply-templates select="node()|@*" />
    </xsl:copy>
  </xsl:template>
  <xsl:template match="//skippedtestcase[@classname='org.auraframework.test.ComponentJSTestSuiteTest$ComponentTestCase']">
    <xsl:copy>
      <xsl:attribute name="classname">
        <xsl:value-of select="concat($jstestPrefix, substring-before(@name, '$'))" />
      </xsl:attribute>
      <xsl:attribute name="name">
        <xsl:value-of select="substring-after(@name, '$')" />
      </xsl:attribute>
      <xsl:copy-of select="@*[not(name()='name')]" />
      <xsl:copy-of select="child::*" />
    </xsl:copy>
  </xsl:template>
  <xsl:template match="//testcase[@classname='org.auraframework.test.ComponentJSTestSuiteTest$ComponentTestCase']">
    <xsl:copy>
      <xsl:attribute name="classname">
        <xsl:value-of select="concat($jstestPrefix, substring-before(@name, '$'))" />
      </xsl:attribute>  
      <xsl:attribute name="name">
        <xsl:value-of select="substring-after(@name, '$')" />
      </xsl:attribute>
      <xsl:copy-of select="@*[not(name()='name' or name()='classname')]" />
      <xsl:copy-of select="child::*" />
    </xsl:copy>
  </xsl:template>
</xsl:stylesheet>
