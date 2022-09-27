var html = "";
var ArduinoTemplate = "";
ArduinoTemplate += "#include &lt;LiquidCrystal.h&gt;\n";
ArduinoTemplate += "\n";
ArduinoTemplate += "LiquidCrystal lcd(12, 11, 5, 4, 3, 2); // RS, E, D4, D5, D6, D7\n";
ArduinoTemplate += "\n";
ArduinoTemplate += "byte customChar[8] = {\n";
ArduinoTemplate += "  {DataX0},\n";
ArduinoTemplate += "  {DataX1},\n";
ArduinoTemplate += "  {DataX2},\n";
ArduinoTemplate += "  {DataX3},\n";
ArduinoTemplate += "  {DataX4},\n";
ArduinoTemplate += "  {DataX5},\n";
ArduinoTemplate += "  {DataX6},\n";
ArduinoTemplate += "  {DataX7}\n";
ArduinoTemplate += "};\n";
ArduinoTemplate += "\n";
ArduinoTemplate += "void setup() {\n";
ArduinoTemplate += "  lcd.begin(16, 2);\n";
ArduinoTemplate += "  lcd.createChar(0, customChar);\n";
ArduinoTemplate += "  lcd.home();\n";
ArduinoTemplate += "  lcd.write((uint8_t)0);\n";
ArduinoTemplate += "}\n";
ArduinoTemplate += "\n";
ArduinoTemplate += "void loop() { }";

var ArduinoI2CTemplate = "";
ArduinoI2CTemplate += "#include &lt;Wire.h&gt;\n";
ArduinoI2CTemplate += "#include &lt;LiquidCrystal_I2C.h&gt;\n";
ArduinoI2CTemplate += "\n";
ArduinoI2CTemplate += "// LCD adresini NXP ile PCF8574'te 0x27'ye ve Ti ile PCF8574A'da 0x3F'ye ayarlayın\n";
ArduinoI2CTemplate += "LiquidCrystal_I2C lcd(0x3F, 16, 2);\n";
ArduinoI2CTemplate += "\n";
ArduinoI2CTemplate += "byte customChar[8] = {\n";
ArduinoI2CTemplate += "  {DataX0},\n";
ArduinoI2CTemplate += "  {DataX1},\n";
ArduinoI2CTemplate += "  {DataX2},\n";
ArduinoI2CTemplate += "  {DataX3},\n";
ArduinoI2CTemplate += "  {DataX4},\n";
ArduinoI2CTemplate += "  {DataX5},\n";
ArduinoI2CTemplate += "  {DataX6},\n";
ArduinoI2CTemplate += "  {DataX7}\n";
ArduinoI2CTemplate += "};\n";
ArduinoI2CTemplate += "\n";
ArduinoI2CTemplate += "void setup() {\n";
ArduinoI2CTemplate += "  lcd.begin();\n";
ArduinoI2CTemplate += "  lcd.createChar(0, customChar);\n";
ArduinoI2CTemplate += "  lcd.home();\n";
ArduinoI2CTemplate += "  lcd.write((uint8_t)0);\n";
ArduinoI2CTemplate += "}\n";
ArduinoI2CTemplate += "\n";
ArduinoI2CTemplate += "void loop() { }";

function binaryToHex(s) {
	var i, k, part, accum, ret = '';
	for (i = s.length - 1; i >= 3; i -= 4) {
		// 4'ün alt dizilerinde çıkar ve hex'e dönüştür
		part = s.substr(i + 1 - 4, 4);
		accum = 0;
		for (k = 0; k < 4; k += 1) {
			if (part[k] !== '0' && part[k] !== '1') {
				// geçersiz karakter
				return {
					valid: false
				};
			}
			// 4 alt dize uzunluğunu hesapla
			accum = accum * 2 + parseInt(part[k], 10);
		}
		if (accum >= 10) {
			// 'A' ile 'F'
			ret = String.fromCharCode(accum - 10 + 'A'.charCodeAt(0)) + ret;
		} else {
			// '0' ile '9'
			ret = String(accum) + ret;
		}
	}
	// kalan karakterler, i = 0, 1 veya 2
	if (i >= 0) {
		accum = 0;
		// önden dönüştür
		for (k = 0; k <= i; k += 1) {
			if (s[k] !== '0' && s[k] !== '1') {
				return {
					valid: false
				};
			}
			accum = accum * 2 + parseInt(s[k], 10);
		}
		// 3 bit, değer 2 ^ 3 - 1 = 7'yi geçemez, sadece dönüştür
		ret = String(accum) + ret;
	}
	return {
		valid: true,
		result: ret
	};
}

reloadData = function () {
	$("[name='datatype']").each(function (index, element) {
		if ($(this).is(":checked")) type = $(this).val();
	});
	var Data = [];
	for (var x = 0; x <= 7; x++) {
		var BinStr = "";
		for (var y = 0; y <= 4; y++) {
			if ($(".dot-px[data-x='" + x + "'][data-y='" + y + "']").attr("class").indexOf("high") >= 0) {
				BinStr += "1";
			} else {
				BinStr += "0";
			}
		}
		Data[x] = type == "hex" ? "0x" + binaryToHex(BinStr)['result'] : "B" + BinStr;
	}
	var interfacing;
	$("[name='interfacing']").each(function (index, element) {
		if ($(this).is(":checked")) interfacing = $(this).val();
	});
	html = interfacing == "parallel" ? ArduinoTemplate : ArduinoI2CTemplate;
	for (var i = 0; i <= 7; i++) {
		html = html.replace("{DataX" + i + "}", Data[i]);
	}
	$("#code-box").html(html);
	Prism.highlightAll();
}

$(document).ready(function (e) {
	var inverted = false;

	$(".dot-px").click(function (e) {
		if ($(this).attr("class").indexOf("high") >= 0) {
			$(this).removeClass("high");
		} else {
			$(this).addClass("high");
		}
		reloadData();
	});

	$("[name='color']").change(function (e) {
		$(".box-char").removeClass("green").removeClass("blue").addClass($(this).val());
	});

	$("[name='datatype'], [name='interfacing']").change(function (e) {
		reloadData();
	});

	var clearElement = function (el) {
		if (inverted) {
			el.addClass("high");
		} else {
			el.removeClass("high");
		}
	};

	var toggleElement = function (el) {
		if (el.hasClass("high")) {
			el.removeClass("high");
		} else {
			el.addClass("high");
		}
	};

	var copyElement = function (src, dst) {
		if (src.hasClass("high")) {
			dst.addClass("high");
		} else {
			dst.removeClass("high");
		}
	};

	var getElement = function (x, y) {
		return $(".dot-px[data-x='" + x + "'][data-y='" + y + "']");
	};

	$("#clear").click(function (e) {
		for (var x = 0; x <= 7; x++) {
			for (var y = 0; y <= 4; y++) {
				clearElement(getElement(x, y));
			}
		}
		reloadData();
	});

	$("#invert").click(function (e) {
		for (var x = 0; x <= 7; x++) {
			for (var y = 0; y <= 4; y++) {
				toggleElement(getElement(x, y));
			}
		}
		reloadData();
		inverted = !inverted;
	});

	$("#up").click(function (e) {
		for (var x = 1; x <= 7; x++) {
			for (var y = 0; y <= 4; y++) {
				var el = getElement(x, y);
				var prev = getElement(x - 1, y);
				copyElement(el, prev);
			}
		}

		for (var y = 0; y <= 4; y++) {
			clearElement(getElement(7, y));
		}

		reloadData();
	});

	$("#down").click(function (e) {
		for (var x = 7; x >= 0; x--) {
			for (var y = 0; y <= 4; y++) {
				var el = getElement(x, y);
				var next = getElement(x + 1, y);
				copyElement(el, next);
			}
		}

		for (var y = 0; y <= 4; y++) {
			clearElement(getElement(0, y));
		}

		reloadData();
	});

	$("#left").click(function (e) {
		for (var x = 0; x <= 7; x++) {
			for (var y = 1; y <= 4; y++) {
				var el = getElement(x, y);
				var prev = getElement(x, y - 1);
				copyElement(el, prev);
			}
		}

		for (var x = 0; x <= 7; x++) {
			clearElement(getElement(x, 4));
		}

		reloadData();
	});

	$("#right").click(function (e) {
		for (var x = 0; x <= 7; x++) {
			for (var y = 4; y >= 0; y--) {
				var el = getElement(x, y);
				var next = getElement(x, y + 1);
				copyElement(el, next);
			}
		}

		for (var x = 0; x <= 7; x++) {
			clearElement(getElement(x, 0));
		}

		reloadData();
	});


	$("#preview").click(function (e) {
		$(".box-char").toggleClass("preview");
	});

	reloadData();
});

//copy

function copyFunction() {
	var dummy = document.createElement("textarea");
	document.body.appendChild(dummy);
	dummy.value = html;
	dummy.select();
	document.execCommand("copy");
	document.body.removeChild(dummy);
	$("#copybutton").html('<button type="copybutton" onclick="copyFunction()" class="copybuttons">Kopyalandı!</button>');
	setTimeout(() => {
		$("#copybutton").html('<button type="copybutton" onclick="copyFunction()" class="fa fa-copy">&nbsp;Kopyala</button>');
	}, 800);
}
// Karakterleri döngüyle oluşturuyor
/* var elements = ""
for (var i = 0; i <= 7; i++) {
	elements += "<div class=\"col\">"

	for (j = 0; j <= 4; j++) {
		elements += "<div class=\"dot-px\" data-x=\"" + i + "\" data-y= \"" + j + "\"></div>"
	}

	elements += "</div>"

	if (i == 7) {
		document.getElementById("loop").innerHTML = elements
	} */