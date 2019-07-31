
  <%@ page import="com.kony.web.WEBConstants,com.kony.web.KonyAppConfig,java.util.*" %>
    <%
    response.setDateHeader("Expires", (new Date(0)).getTime());
    response.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, post-check=0, pre-check=0, max-age=0");
    response.setHeader("Pragma", "no-cache");
    %>
  <%
	KonyAppConfig appConfig = (KonyAppConfig) application.getAttribute(WEBConstants.KONY_APP_CONFIG);
	String propertiesJSON = (String) application.getAttribute(appConfig.getAppID() + WEBConstants.THINCLIENT_PROPERTIES + "_JSON");
	String headersJSON = (String) request.getAttribute("headersJSON");
	String paramsJSON = (String) request.getAttribute("paramsJSON");
  %>


<!DOCTYPE HTML>
<html >
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"/>
        
        
        
        
        
        
        
        
        
        
        
        
<script type="text/javascript"> 
if (document.getElementById && document.createElement) {
    document.write("<style>html {display: none;}</style><script>if( self == top ){document.documentElement.style.display = 'block';} else {top.location = self.location;}</sc"+"ript>");
}
else {
    if (top != self) {
        top.location = self.location;
    }
}
</script>

        
        
         
   
 
   

        
		<script type="text/javascript">
		    
                </script>
                <style>
                    
                    @-webkit-keyframes FadeIn { 0% { opacity:0; } 100% { opacity:1; } }
                    

                   .splashscreen
                   {
                        position: fixed !important;
                        position: absolute;
                        top: 0px;
                        right: 0px;
                        left: 0px;
                        bottom: 0px;
                        
                        background-color: #ffffff;
                        
                    }
                    .splashscreen2
                    {
                        text-align: center;
                        height:100%;
                    }
                    .splashscreen-image
                    {
                        
                        width:100%;
                        height:100%;
                    }
           </style>
            
        
        

		
                <meta name="apple-mobile-web-app-capable" content="yes"/>
		<script>
			(function ()
			{
				// load kony css
				var dpratio = window.devicePixelRatio;
				var category;
				if (dpratio <= 1) {
				  category = 320;
				} else if(dpratio <= 1.5){
				  category = 360;
				} else if(dpratio <= 2) {
				  category = 400;
				} else if(dpratio>2){
				  category = 440;
				}
				var filename = "spaandroid/konyspaandroid" + category + ".css?ver=1.0.0";
				var link = document.createElement("link");
				link.setAttribute("rel", "stylesheet");
				link.setAttribute("type", "text/css");
				link.setAttribute("href", filename);
				document.getElementsByTagName("head")[0].appendChild(link);
                                
			})();
                       ;
		</script>
		

       
       

        

        
        
        

        
       
    </head>

    <body>
		<DIV id="splashDiv">
        
             <input type="hidden" name="_konyAppProperties" value='<%=propertiesJSON%>' >
             <input type="hidden" name="_reqHeaders" value='<%=headersJSON%>' >
             <input type="hidden" name="_reqParams" value='<%=paramsJSON%>'>
             <% Object sessionObj = request.getSession(false); %>
             <div style="display:none" id="sessionId" ><%= request.getSession().getId() %></div>
             <%
                if(sessionObj == null || session.getAttribute("spa") == null){
                        %>
                        <div id="isnewsession" style="display:none">true</div>
                        <%
                        session = request.getSession();
                        session.setAttribute("spa","spa");
                }else{
                        %>
                        <div id="isnewsession" style="display:none">false</div>
                        <%
                }
             %>
        

        
		



		<noscript style="position:absolute;background:white;">$noscriptmessage</noscript>



                <style>
			#__JSDisabledErrorMsg{display:none;}
		</style>
		<noscript>
			<style>
				#__JSDisabledErrorMsg{display:block;}
				#splashScreen_main{display:none;}
			</style>
		</noscript>
		<div id="__JSDisabledErrorMsg" style="position:absolute;background:white;">$noscriptmessage</div>

        <script type="text/javascript" >
                

                
                
                
                    IndexJL = 0;
    		
    		var spaMarkup = "spaandroid/"; spaMarkup = spaMarkup.substring(0,spaMarkup.length-1);
                
                    function initappcache() {
                            $KG["version"] = "1.0.0";
                            $KG["staticContentPath"] =  "";
                            kony.appinit.initappcache();
                    }
                    var head = document.getElementsByTagName('head')[0];
                    var script = document.createElement('script');
                    appStartTime = new Date().getTime();
                    script.src = "spaandroid/jslib/konyinit.js";
                    script.onload = initappcache;
                    head.appendChild(script);
                

        </script>
		</DIV>
    </body>
</html>
