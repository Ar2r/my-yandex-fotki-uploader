function encrypt_yarsa(key, toenc)
{
	/* Encode string like RSA
	 * Ported to JS by Artur Khasanov
	 * EMail: artur[at]hasanov.ru
	 * Website: http://hasanov.ru
	 * JS source: http://wiki.hasanov.ru/software/yandex-rsa
	 * Ported from Python script written by http://lomik.habrahabr.ru/
	 */
	var DATA_ARR = [];
	var NSTR = key.split('#')[0];
	var ESTR = key.split('#')[1];
	var N = bigInt2str(str2bigInt(NSTR,  16,0),10);
	var E = bigInt2str(str2bigInt(ESTR,  16,0),10);
	var STEP_SIZE = NSTR.length/2-1;
	var prev_crypted = new Array(STEP_SIZE);
	var hex_out = "";
	var plain = new String();
	for(i=0;i<toenc.length;i++)DATA_ARR[i] = ord(toenc.substr(i,1));
	for(i=0;i<parseInt((DATA_ARR.length-1)/STEP_SIZE)+1;i++){
		tmp = DATA_ARR.slice(i*STEP_SIZE, (i+1)*STEP_SIZE);
		for(j=0;j<tmp.length;j++)tmp[j] = (tmp[j] ^ prev_crypted[j]);
		tmp.reverse();
		var plain = int2bigInt(0,0);
		for(x=0;x<tmp.length;x++){
			pow = powMod(int2bigInt(256,0), int2bigInt(x,0), N);
			pow_mult = mult(pow, int2bigInt(tmp[x],0));
			plain = add(plain, pow_mult);
		}
		plain_pow = powMod(plain, str2bigInt(E,10,0), str2bigInt(N,10,0));
		plain_pow_str = bigInt2str(plain_pow, 16);
		hex_result = new Array((NSTR.length - plain_pow_str.length) + 1).join('0') + plain_pow_str;
		min_x = Math.min(hex_result.length, prev_crypted.length*2);
		for(x=0;x<min_x;x=x+2)prev_crypted[x/2] = parseInt("0x"+hex_result.substr(x, 2));		
		if(tmp.length < 16) hex_out+="00";
		hex_out += tmp.length.toString(16).toUpperCase() + "00";
		ks = NSTR.length/2;
		if(ks<16) hex_out += "0";
		hex_out += ks.toString(16).toUpperCase() + "00"; 
		hex_out += hex_result;

	}
	return base64Encode(hexDecode(hex_out.toLowerCase())).replace(/[\n\r\t]/g, "");
}


var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
/* Base64 conversion methods.
 * Copyright (c) 2006 by Ali Farhadi.
 * released under the terms of the Gnu Public License.
 * see the GPL for details.
 *
 * Email: ali[at]farhadi[dot]ir
 * Website: http://farhadi.ir/
 */

//Encodes data to Base64 format
function base64Encode(data){
	if (typeof(btoa) == 'function') return btoa(data);//use internal base64 functions if available (gecko only)
	var b64_map = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
	var byte1, byte2, byte3;
	var ch1, ch2, ch3, ch4;
	var result = new Array(); //array is used instead of string because in most of browsers working with large arrays is faster than working with large strings
	var j=0;
	for (var i=0; i<data.length; i+=3) {
		byte1 = data.charCodeAt(i);
		byte2 = data.charCodeAt(i+1);
		byte3 = data.charCodeAt(i+2);
		ch1 = byte1 >> 2;
		ch2 = ((byte1 & 3) << 4) | (byte2 >> 4);
		ch3 = ((byte2 & 15) << 2) | (byte3 >> 6);
		ch4 = byte3 & 63;
		
		if (isNaN(byte2)) {
			ch3 = ch4 = 64;
		} else if (isNaN(byte3)) {
			ch4 = 64;
		}

		result[j++] = b64_map.charAt(ch1)+b64_map.charAt(ch2)+b64_map.charAt(ch3)+b64_map.charAt(ch4);
	}

	return result.join('');
}


/* Hexadecimal conversion methods.
 * Copyright (c) 2006 by Ali Farhadi.
 * released under the terms of the Gnu Public License.
 * see the GPL for details.
 *
 * Email: ali[at]farhadi[dot]ir
 * Website: http://farhadi.ir/
 */

//Encodes data to Hex(base16) format
function hexEncode(data){
	var b16_digits = '0123456789abcdef';
	var b16_map = new Array();
	for (var i=0; i<256; i++) {
		b16_map[i] = b16_digits.charAt(i >> 4) + b16_digits.charAt(i & 15);
	}
	
	var result = new Array();
	for (var i=0; i<data.length; i++) {
		result[i] = b16_map[data.charCodeAt(i)];
	}
	
	return result.join('');
}

//Decodes Hex(base16) formated data
function hexDecode(data){
	var b16_digits = '0123456789abcdef';
	var b16_map = new Array();
	for (var i=0; i<256; i++) {
		b16_map[b16_digits.charAt(i >> 4) + b16_digits.charAt(i & 15)] = String.fromCharCode(i);
	}
	if (!data.match(/^[a-f0-9]*$/i)) return false;// return false if input data is not a valid Hex string
	
	if (data.length % 2) data = '0'+data;
		
	var result = new Array();
	var j=0;
	for (var i=0; i<data.length; i+=2) {
		result[j++] = b16_map[data.substr(i,2)];
	}

	return result.join('');
}

function ord( string ) {	// Return ASCII value of character
	code = string.charCodeAt(0);
	if(code>900)code=code-848; // Может и не 900, но так работает точно. 
	return code;
	}