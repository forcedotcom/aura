<?xml version="1.0" encoding="UTF-8" ?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
	version="1.0">
	<xsl:output method="xml" indent="yes" />
	<xsl:variable name="lowercase" select="'abcdefghijklmnopqrstuvwxyz'" />
	<xsl:variable name="uppercase" select="'ABCDEFGHIJKLMNOPQRSTUVWXYZ'" />

	<xsl:template match="/xunit/run">
		<testsuite tests="{@count}" failures="{@failures}" errors="{@errors}"
			skipped="{@skipped}" time="{@duration}" name="xUnit.js" timestamp="{@timestamp}">
			<properties>
				<xsl:for-each select="/xunit/files/file">
					<property name="file" value="{@path}" />
				</xsl:for-each>
			</properties>
			<xsl:for-each select="/xunit/facts/fact">
				<testcase time="{@duration}" classname="xunit" name="{@path}">
					<xsl:if test="@result!='Success'">
						<xsl:element name="{translate(@result,$uppercase,$lowercase)}">
							<xsl:attribute name="message">
							     <xsl:value-of select="@message" />
							</xsl:attribute>
							<xsl:value-of select="@message" />
						</xsl:element>
					</xsl:if>
				</testcase>
			</xsl:for-each>
		</testsuite>
	</xsl:template>
</xsl:stylesheet>