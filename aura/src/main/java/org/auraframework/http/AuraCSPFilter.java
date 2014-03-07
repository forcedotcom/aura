package org.auraframework.http;

import java.io.IOException;

import javax.servlet.*;

import org.auraframework.http.CSP.PolicyBuilder;

public class AuraCSPFilter implements Filter {

    @Override
    public void destroy() {
        // TODO Auto-generated method stub
    }

    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain) throws IOException,
            ServletException {

//        HttpServletResponse response = (HttpServletResponse) res;
        
        PolicyBuilder p = new PolicyBuilder();
        
        p
        .script_src(
                "https://apis.google.com",
                "https://platform.twitter.com")
        .frame_src(
                "https://plusone.google.com",
                "https://facebook.com",
                "https://platform.twitter.com");
        
//        response.setHeader(CSP.Header.REPORT_ONLY.toString(), p.build());
        
        chain.doFilter(req, res);
    }

    @Override
    public void init(FilterConfig config) throws ServletException {
        // TODO Auto-generated method stub
    }

}
