var ya_login = getPref('login');
//var ya_pass = getPref('password');
var ya_textarea;
var ya_domain;
var ya_uploading=false;
var counter=0;
var files_count=0;

var files_array = new Array(); //Массив с files

var token;
var creditential;
var key;
var request_id;
var req = new XMLHttpRequest(); 

//url to upload photos
//var url = "http://hasanov.ru/up.php";
var url = "http://api-fotki.yandex.ru/api/users/"+getPref('login')+"/photos/";
var filename;
var mytext;
var http_request = new Array();

    




//После загрузки страницы - запустить процедуру
function dndinit(){
    //Грузим настройки
    document.getElementById('mi_' + getPref('template')).setAttribute("checked", "true");  
    
    //Далее
	var appcontent = document.getElementById("appcontent"); // browser
	if(appcontent)
    {
        //tryGetToken(); 
		checkToken();
        appcontent.addEventListener("DOMContentLoaded", onPageLoad, true);
    } 
}

//вешаем экшен на textarea
function onPageLoad(event) {  
        var doc = event.originalTarget;
        var ee = doc.getElementsByTagName('textarea');
        for(var i = 0; i < ee.length; i++) {
			ee[i].addEventListener("dragover", function(event) { event.preventDefault();}, true);
			ee[i].addEventListener('drop', onDrop, true);
        }
}

//Отпустили файл в текстарею
function onDrop(event) {

	
	if(event.target.parentNode.nodeName != 'TEXTAREA')
	{
	//alert('NOT textarea'+event.target.parentNode);
	return;
	}


	if(!checkToken())
	{
	alert('You dont fill login and password to get Token');
	}

    if(files_count>0){
        alert("Only one upload stream a time. Wait while it finish.");
        return false;
    }

    event.stopPropagation(); 
    event.preventDefault();

	//На случай, если настройки обнулить в процессе загрузки фоток
	token = getPref('token');
    var dt = event.dataTransfer;  
    var files = dt.files;  
    count = files.length;  
	for (var i = 0; i < count; i++) 
	{
		//this.textContent += " File " + i + ":\n(" + (typeof files[i]) + ") : <" + files[i] + " > " + files[i].name + " " + files[i].size + "\n"; 
		var types = dt.mozTypesAt(i);
		for (var t = 0; t < types.length; t++) 
		{
			if (types[t] == "application/x-moz-file") 
			{
				try 
				{
					ya_textarea = event.target.parentNode; //this;
                    ya_domain = content.location.href;
					files_array.push(files[i]);
				} 
				catch (ex) 
				{
                    alert('onDrop unknown');
				}
			}
		}
	}
	if(files_array.length>0){
		//Если число перетащеных файлов больше нуля.
		files_count=files_array.length; //Суммарное число файлов...
		conveerFiles(files_array); //Запускаем пинг понг
	}
}

function RefreshUploadLable(add_str){
	if(!add_str)add_str='';
	setLable(add_str + 'Upload: ' + (files_count-files_array.length) + '/'+files_count);
}

//Функция дергает первый файл из массива и загружает его. Потом удаялет его из массива.
function conveerFiles(){
	if(files_array.length==0)
	{
		//setLable('Total upload: '+files_count);
		setLable();
		setStatusImage('ok');
		files_count=0;
		ya_uploading=false;
		ya_textarea=null;
		return true;
	}
	setStatusImage('upload');
	file = files_array[0];
	RefreshUploadLable(); //Обновляем статус загрузки и картинку
	files_array.shift(); //- удалить первый элемент из массива
	ajax_upload(file); 

}

function updateProgress(evt) {  
   if (evt.lengthComputable) {  
     var percentComplete = evt.loaded / evt.total;  
     //alert()  
   } else {  
     // Unable to compute progress information since the total size is unknown  
   }  
 }  


function ajax_upload(file) {
	counter++;
    filename =  document.domain + '.' + file.name;
    try {
		netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
	} catch (e) {
		alert("Permission to read file was denied.");
	}

    http_request[counter] = new XMLHttpRequest();
    if (!http_request[counter]) {
        alert('Cannot create XMLHTTP instance');
        return false;
    }

    http_request[counter].onprogress = updateProgress; 
    http_request[counter].addEventListener("progress", updateProgress, false); 
	http_request[counter].addEventListener("readystatechange", onreadystatechange, false);
    http_request[counter].upload.addEventListener("progress", function(e) {
		//Отображать проценты загрузки только если настройка включена
      if (	e.lengthComputable && getPref('show_upload_percent')	 ) {
		var percentage = Math.round((e.loaded * 100) / e.total);
		RefreshUploadLable(' ['+percentage+'%] ');
      }
    }, false);
	http_request[counter].filename = file.name;
    http_request[counter].open('POST', url, true);
	http_request[counter].setRequestHeader("Content-type", "image/jpeg");
	http_request[counter].setRequestHeader("Slug", filename);
	http_request[counter].setRequestHeader("Authorization", "FimpToken realm=\"fotki.yandex.ru\", token=\""+token+"\"");
	http_request[counter].setRequestHeader("Content-length", file.getAsBinary().length);
	http_request[counter].sendAsBinary( file.getAsBinary());
    //setStatusMessage('sendAsBinary...' + file.getAsBinary().length + ' bytes');
    return;
}
 
function onreadystatechange(evt){
     if (http_request[counter].readyState == 4) {
        //Код ответа 201 = Created!!!!!!!!!!!!!!!!!
        if(http_request[counter].status == 201)
        {
            result = http_request[counter].responseText;
			//alert(http_request[counter].filename);
            img_url = http_request[counter].responseXML.documentElement.getElementsByTagName("content")[0].getAttribute('src')+'.jpg';
			ya_xml = http_request[counter].responseXML.documentElement;
            //Перепибираем все link теги в поиска Rel атрибута            
            for (var k = 0; k < ya_xml.getElementsByTagName("link").length; k++)
            {
                if(ya_xml.getElementsByTagName("link")[k].getAttribute('rel')=='edit')
                {
                    edit_url = ya_xml.getElementsByTagName("link")[k].getAttribute('href');
                    result = result.replace(/Фотка/gi, ya_domain);
                    http_request[counter*1000] = new XMLHttpRequest();
                    http_request[counter*1000].open('PUT', edit_url, false);
                    http_request[counter*1000].setRequestHeader("Content-type", "application/atom+xml; charset=utf-8; type=entry");
                    http_request[counter*1000].setRequestHeader("Authorization", "FimpToken realm=\"fotki.yandex.ru\", token=\""+token+"\"");
                    http_request[counter*1000].send(result);
                    if (http_request[counter*1000].readyState == 4)if(http_request[counter*1000].status == 200)
                    {
                        //setStatusMessage('Photo title updated');
                    }
                }    
            }
            pasteInTextarea(img_url, http_request[counter].filename);
			conveerFiles();
        }
    }    
 }


function pasteInTextarea(str, filename){
    if(!ya_textarea)alert('No active textarea!');
    template_name = 'template.'+getPref('template');
    if(getPref(template_name))
    {                                  
        var tmp_template = getPref(template_name);//.replace(/PATH/gi, str);
		tmp_template = tmp_template.replace('%FILENAME%', filename );
		tmp_template = tmp_template.replace('%PATH_XL%', str.replace('_XL','_XL') );
		tmp_template = tmp_template.replace('%PATH_L%', str.replace('_XL','_L') );
		tmp_template = tmp_template.replace('%PATH_M%', str.replace('_XL','_M') );
		tmp_template = tmp_template.replace('%PATH_S%', str.replace('_XL','_S') );
		tmp_template = tmp_template.replace('%PATH_XS%', str.replace('_XL','_XS') );
		tmp_template = tmp_template.replace('%PATH_XXS%', str.replace('_XL','_XXS') );
		tmp_template = tmp_template.replace('%PATH_XXXS%', str.replace('_XL','_XXXS') );
		tmp_template = tmp_template.replace('%PATH%', str.replace('_XL','_orig') );
        ya_textarea.value = ya_textarea.value + "\n" + tmp_template;
        //setStatusMessage('Img:' + img_url); 
    }
    return true;    
}





function getToken(){
		req = null;
		req = new XMLHttpRequest();  
		req.open('POST',"http://auth.mobile.yandex.ru/yamrsa/token/?rand="+Math.floor(Math.random()*10000000) , false);   
	
		req.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
		var params  = 'request_id='+myescape(request_id)+'&credentials='+myescape(creditential);
		req.send(params);  


		
		if(req.status == 200)  
		{
			token = req.responseXML.documentElement.getElementsByTagName("token")[0].firstChild.data;
			return true;
		}
		else
		{
			//alert('Err Crediten:'+creditential + '\n'+req.getAllResponseHeaders()+'\n'+req.responseText);
			error_code = req.responseXML.documentElement.getElementsByTagName("error")[0].getAttribute('code');
			if(error_code==2)alert('Incorrect login and password\nЛогин или пароль не правильный.\n Логин нужно указывать без @yandex.ru');
			else alert('Код ошибки скопирован в буфер обмена. Отправьте его на artur@hasanov.ru :\n' + req.responseText);

		 copy_clip(req.responseText + '\n' +  params);
			return false;
		}
}


function tryGetToken(login, pass)
{
 req.open('GET', 'http://auth.mobile.yandex.ru/yamrsa/key/', false);   
 req.send(null);  
 if(req.status == 200)  
 {
   //alert(req.responseText);  
   //alert(req.responseXML);
  xmlRoot = req.responseXML.documentElement; 
  key = xmlRoot.getElementsByTagName("key")[0].firstChild.data;
  request_id = xmlRoot.getElementsByTagName("request_id")[0].firstChild.data;
	req = new XMLHttpRequest();login_pass_str = '<credentials login="'+ login +'" password="'+ pass +'"/>';
	creditential = encrypt_yarsa(key, login_pass_str);
	if(getToken()==false)
	 {
		//alert('Token not found');
	 }
	else 
	 {
		setPref('token', token);
		DisableLoginInput('true');
	 }
 }
}//end trygettoken


// Графическая анимация зарегистрированного токе.
function checkToken()
{
	token = getPref('token');

	//ТУТ БУДЕТ ПРОВЕРКА ТОКЕН+ЛОГИН по какому-то признаку.

	if(token.length>0)
	{
		//setStatusMessage('Token:' + token);
		setStatusImage('ok');
		setLable();
		return true;
	}
	else
	{
		setStatusMessage('Token not found');
		setStatusImage('error');
		setLable();
		return false;
	}

}

// Получаем список коллекций Яндекс.фотки
function yaCollections()
{
	req = new XMLHttpRequest();  
	params =  'http://api-fotki.yandex.ru/api/users/'+getPref('login')+'/';
	req.setRequestHeader("Authorization", "FimpToken realm=\"fotki.yandex.ru\", token=\""+getPref('token')+"\"");
	req.open('GET',params, false);   
	req.send();  
	if(req.status == 200)  
	{
		//alert('Collections:'+req.responseText);
	}
	else
	{
		alert(req.getAllResponseHeaders()+'\n'+req.responseText);
	}
}

// Функция инициализации получения токена
function getConfToken(event)
{
	var login = TrimStr( document.getElementById('symbol_1').value );
	login = login.toLowerCase().split('@')[0]; //Вырезаем то, что до собаки =)
	setPref('login', login);
	var pass = TrimStr( document.getElementById('symbol_2').value );

	checkToken();

	if(!event)if(login.length==0 || pass.length==0)
		{
			alert('Login or password empty');

			return false;
		}

	if(login && pass)tryGetToken(login, pass);

	checkToken();
}


function eventTabChange(event) {
  //var browser = gBrowser.selectedBrowser;
  //alert('tab_change');
  // browser is the XUL element of the browser that's just been selected
}

// During initialisation
//var container = gBrowser.tabContainer;
//container.addEventListener("TabSelect", eventTabChange, false);


function drag_listener(event)
{
    //event.stopPropagation(); 
	//alert(event.target.nodeName);
	if(event.target.nodeName == 'TEXTAREA')
	{
	//alert('NOT textarea'+event.target.nodeName);
	event.preventDefault();
	//return;
	}
    
}

function myf_init(event)
{
    document.getElementById('mi_' + getPref('template')).setAttribute("checked", "true");  
	var appcontent = document.getElementById("appcontent"); // browser
	if(appcontent)
    {
		checkToken();
    } 
}

window.addEventListener('load', myf_init, false);
window.addEventListener('dragover', drag_listener, true);
window.addEventListener('drop', onDrop, true);
