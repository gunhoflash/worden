var tableName = null;
var numberOfResult = 20;
var startId = 1;
var endId = numberOfResult;
var overlayIsOn = 0;

function requestWord(highlightID)
{
	$.post(
		'phpTest.php',
		{ tableName: tableName, startId: startId, endId: endId, mode: "getTable", isAdmin: 0 },
		function (result)
		{
			// Create table
			$("#phpData").html(result).trigger("create");

			// Highlight searching word
			if (highlightID != 0)
				$("#phpData .phpTableRow[data-value=\"" + highlightID + "\"] td")
				.css({ "background-color": "#FFFFFF", "font-weight": "bolder" });

			$("#phpData .phpTableWordColumn").click(function ()
			{
				var target = $(this);
				console.log("click : " + target.data("value"));
				if (target.hasClass("tts-not-yet"))
				{
					$.post('tts.php',
					{ text: target.data("value") },
					function (result)
					{
						if (result == 1)
						{
							target.removeClass("tts-not-yet")
							.append("<audio src=\"tts/"+target.data("value")+".mp3\"></audio>")
							.find("audio")[0].play();
						}
						else
						{
							console.log("tts error");
							alert("[에러] " + result);
						}
					}, "json");
				}
				else
				{
					target.find("audio")[0].play();
				}
			});
		}
	);
	$.post(
		'phpTest.php',
		{ tableName: tableName, startId: startId, endId: endId, mode: "getNumber", isAdmin: 0 },
		function (result)
		{
			var numbers = result.split(".");
			if (numbers[0] == 0)
			{
				$("#prevButton").addClass("disabled");
			}
			else if (numbers[1] == 0)
			{
				$("#nextButton").addClass("disabled");
			}
			else
			{
				$("#nextButton").removeClass("disabled");
				$("#prevButton").removeClass("disabled");
			}
		}
	);
}

function startSearching()
{
	if ($("#SearchBox_input input").val().length == 0)
		return;

	var queryMode = "findWord_by" + $("#SearchBoxDropdown span").text();

	$.post(
		'phpTest.php',
		{ tableName: tableName, startId: 0, endId: 0, mode: queryMode, isAdmin: 0,
			searchingText: $("#SearchBox_input input").val()
		},
		function (result)
		{
			if (parseInt(result) == 0)
				alert("검색 결과 없음\nNo result");
			else
			{
				startId = parseInt(parseInt(result - 1) / numberOfResult) * numberOfResult + 1;
				endId = startId + numberOfResult - 1;
				requestWord(result);
			}
		}
	);
}
function showAllTables()
{
	$.post('showAllTables.php', function (result)
	{
		for(var i = 0; i < result.length; i++)
		{
			// show visible
			if (result[i][4] == 1)
				$("#SideNav ul").append('<li><a data-db='+result[i][0]+' data-tableOrder='+result[i][2]+' data-hasUnit='+result[i][3]+'>'+result[i][1]+'</a></li>');
		}
		$("#SideNav li").addClass('cursor noOutline noTapHighlight');
		$("#SideNav div").addClass('cursor noOutline noTapHighlight');
		$("#SideNav li a").click(function ()
		{
			$("#HeaderSubTitle").text($(this).text());
			tableName = $(this).data("db");
			if (typeof(tableName) == "undefined")
				tableName = null;
			startId = 1;
			endId = numberOfResult;
			requestWord(0);
			overlayIsOn = 0;
			changeOverlay();
		});
		$("#SideNav li a").first().click();
	}, "json");
}

function removeOverlay()
{
	$('#SideNav').css("transform", "");
	$('#SideNav-overlay').velocity({ opacity: 0 }, {
		duration: 200,
		queue: false, easing: 'easeOutQuad',
		complete: function ()
		{
			$('#SideNav-overlay').remove();
		}
	});
	$("#SearchButtonContainer").css("transform", "translateY(100%)");
	$("#SearchButton").css("bottom", "");
}
function showOverlay()
{
	var $overlay = $('#SideNav-overlay');
	if ($overlay.length === 0)
	{
		$overlay = $('<div id="SideNav-overlay"></div>');
		$overlay.css('opacity', 1);
		$overlay.click(function ()
		{
			overlayIsOn = 0;
			changeOverlay();
		});
		$('body').append($overlay);
	}
}
function changeOverlay()
{
	if (overlayIsOn == 1)
		showOverlay();
	else if (overlayIsOn == 0)
		removeOverlay();
}
function removeSearchButtonContainer()
{
	$("#SearchBox input").val("");
	$("#SearchButtonContainer").css("transform", "translateY(100%)");
	$("#SearchButton").css("bottom", "");
}

$(document).ready(function ()
{
	$("#adminButton").click(function ()
	{
		overlayIsOn = 0;
		changeOverlay();
	});
	$("#setting_selectable").click(function ()
	{
		if($("#phpData").hasClass("notSelectable"))
		{
			$("#phpData").removeClass("notSelectable");
			$(this).children("a").text("텍스트 잠금 켜기");
		}
		else
		{
			$("#phpData").addClass("notSelectable");
			$(this).children("a").text("텍스트 잠금 끄기");
		}
		overlayIsOn = 0;
		changeOverlay();
	});
	$("#prevButton").click(function ()
	{
		if ($(this).hasClass('disabled'))
			return;
		startId -= numberOfResult;
		endId -= numberOfResult;
		requestWord(0);
	});
	$("#nextButton").click(function ()
	{
		if ($(this).hasClass('disabled'))
			return;
		startId += numberOfResult;
		endId += numberOfResult;
		requestWord(0);
	});
	$("#MenuButton").click(function ()
	{
		removeSearchButtonContainer();
		$('#SideNav').css("transform", "translatex(0)");
		overlayIsOn = 1;
		changeOverlay();
	});
	$("#SearchButton").click(function ()
	{
		$("#SearchBox input").val("");
		$("#SearchBox input").focus();
		$("#SearchButtonContainer").css("transform", "translateY(0px)");
		$("#SearchButton").css("bottom", "-100%");
		overlayIsOn = 1;
		changeOverlay();
	});
	$("#SearchBoxDropdownMenu div").click(function ()
	{
		$("#SearchBoxDropdown span").text($(this).text());
	});
	$("#SearchBoxSearch").click(function ()
	{
		startSearching();
		removeSearchButtonContainer();
		overlayIsOn = 0;
		changeOverlay();
	});
	$("#SearchBox input").keyup(function(event)
	{
		if (event.keyCode == 13)
			$("#SearchBoxSearch").click();
	});

	//$("#SideNav li a").first().click();
	removeSearchButtonContainer();
	
	showAllTables();
});
