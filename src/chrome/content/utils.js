//Ступид стандарт эскап не экранирует знак плюс.
function myescape(s) {return escape(s).replace(new RegExp('\\+','g'), '%2B');}

//Копируем текст в буфер обмена
function copy_clip(whattext){
    if (window.clipboardData)
    {window.clipboardData.setData("Text", whattext);}
    else if (window.netscape) {
    netscape.security.PrivilegeManager.enablePrivilege('UniversalXPConnect');
    var clip = Components.classes['@mozilla.org/widget/clipboard;1'].createInstance(Components.interfaces.nsIClipboard);
    if (!clip) return;
    var trans = Components.classes['@mozilla.org/widget/transferable;1'].createInstance(Components.interfaces.nsITransferable);
    if (!trans) return;
    trans.addDataFlavor('text/unicode');
    var str = new Object();
    var len = new Object();
    var str = Components.classes["@mozilla.org/supports-string;1"].createInstance(Components.interfaces.nsISupportsString);
    var copytext=whattext;
    str.data=copytext;
    trans.setTransferData("text/unicode",str,copytext.length*2);
    var clipid=Components.interfaces.nsIClipboard;
    if (!clip) return false;
    clip.setData(trans,null,clipid.kGlobalClipboard);}
 return false;
}

function setPref(conf_name, conf_str){
	var prefManager = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
    prefManager.setCharPref("extensions.myf."+conf_name, conf_str);
}

function getPref(conf_name){
	if(!conf_name)return false;
    var prefManager = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
    return prefManager.getCharPref("extensions.myf."+conf_name);
}

function TrimStr(s) {
  s = s.replace( /^\s+/g, '');
  return s.replace( /\s+$/g, '');
}



function setLable(text)
{
	var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                   .getService(Components.interfaces.nsIWindowMediator);
	var mainWindow = wm.getMostRecentWindow("navigator:browser");

	if(!text)showLable();
	else showLable(true);

	mainWindow.document.getElementById('myf-lable').value=text;
}

function showLable(show)
{
	var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                   .getService(Components.interfaces.nsIWindowMediator);
	var mainWindow = wm.getMostRecentWindow("navigator:browser");

	if(show)mainWindow.document.getElementById('myf-lable').setAttribute("style", "");
	else	mainWindow.document.getElementById('myf-lable').setAttribute("style", "display: none;");
}


function setStatusImage(obj){

	var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                   .getService(Components.interfaces.nsIWindowMediator);
	var mainWindow = wm.getMostRecentWindow("navigator:browser");


	//alert(mainWindow.document.getElementById('myf-lable').getAttribute('class'));

	//alert(window.opener.top.document.getElementById('myf-lable'));
	if(obj=='ok')mainWindow.document.getElementById('myf-lable').setAttribute("class", "green");
	if(obj=='error')mainWindow.document.getElementById('myf-lable').setAttribute("class", "red");
	if(obj=='wait')mainWindow.document.getElementById('myf-lable').setAttribute("class", "grey");

	mainWindow.document.getElementById('myf-status-image').src = "chrome://myf/content/img/" + obj + ".png";   
}


function setStatusMessage(obj){
  //document.getElementById('myf-status').tooltipText += "\n" + obj;   
}
function clearStatusMessage(){
  //document.getElementById('myf-status').label = '';
}