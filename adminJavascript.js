var tableName = null;
var numberOfResult = 100;
var startId = 1;
var endId = numberOfResult;
var overlayIsOn = 0;
var maxID = 1;

function requestWord(highlightID)
{
	$.post(
		'phpTest.php',
		{ tableName: tableName, startId: startId, endId: endId, mode: "getTable", isAdmin: 1 },
		function (result)
		{
			// Create table
			$("#phpData").html(result).trigger("create");
			maxID = parseInt($("#phpTable").data("maxid"));

			// Highlight searching word
			if (highlightID != 0)
				$("#phpData .phpTableRow[data-value=\"" + highlightID + "\"] td")
				.css({ "background-color": "#FFFFFF", "font-weight": "bolder" });

			// Whether to use 'Unit'
			$("th.phpTableUnitColumn").click(function (){changeTableUnitable($(this))});
			// Set click-event to change the word in DB
			$("#phpTable .phpTableEditColumn").click(function(){changeRow($(this).parent())});
			// Set key-event to check the edited input
			$("#phpTable input").keyup(function(){inputCheck($(this))});
			$("#phpTable input").click(function(){inputCheck($(this))});
		}
	);
	$.post(
		'phpTest.php',
		{ tableName: tableName, startId: startId, endId: endId, mode: "getNumber", isAdmin: 1 },
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
function inputCheck(input)
{
	if (input.val() != input.attr("placeholder"))
	{
		input.css("color", "#ee6e73");
		input.parent().addClass("isEdited");
		input.parent().parent().children(".phpTableEditColumn")
		.removeClass("invalidEdit")
		.removeClass("notSelectable")
		.addClass("cursor");
	}
	else
	{
		input.css("color", "");
		input.parent().removeClass("isEdited");
		if (input.parent().parent().children(".isEdited").length == 0)
		{
			input.parent().parent().children(".phpTableEditColumn")
			.addClass("invalidEdit")
			.addClass("notSelectable")
			.removeClass("cursor");
		}
	}
}
function changeRow(row)
{
	//var editedNumber = row.children(".isEdited:not(.phpTableIdColumn)").length;
	var IDcolumn = row.children(".phpTableIdColumn").first();
	var afterID = changeID(IDcolumn.data("value"), IDcolumn.children("input").first().val());
	if (afterID == -1)
	{
		alert("실패: 알 수 없는 이유로 변경불가");	
		return;
	}
	else if (row.children(".isEdited:not(.phpTableIdColumn)").length > 0)
	{
		changeWord(
			afterID,
			row.children(".phpTableUnitColumn").first(),
			row.children(".phpTableWordColumn").first(),
			row.children(".phpTableMeanColumn").first());
	}
	// 변경요청 후 클라이언트에서 바꿔주는 작업 필요함
}
function changeID(beforeID, afterID)
{
	if (beforeID == afterID) return afterID;
	var returnID = -1;
	$.post(
		'phpTest.php',
		{ tableName: tableName, startId: startId, endId: endId, mode: "changeID", isAdmin: 1, beforeID: beforeID, afterID: afterID },
		function (result)
		{
			if (parseInt(result) == -1)
			{
				alert("실패: 알 수 없는 이유로 ID 변경불가");	
			}
			returnID = parseInt(result);
		}
	);
	return returnID;
}
function changeWord(rowID, unitColumn, wordColumn, MeanColumn)
{
	if (rowID < 0) return -1;
	var returnID = -1;
	$.post(
		'phpTest.php',
		{ tableName: tableName, startId: startId, endId: endId, mode: "changeWord", isAdmin: 1,
		rowID: rowID,
		unit: unitColumn.children("input").first().val(),
		word: wordColumn.children("input").first().val(),
		mean: meanColumn.children("input").first().val()},
		function (result)
		{
			if (parseInt(result) == -1)
			{
				alert("실패: 알 수 없는 이유로 내용 변경불가");	
			}
			returnID = parseInt(result);
		}
	);
	return returnID;
}
function changeTableUnitable(btn)
{
	if (btn.hasClass("validUnit"))
		$changeTo = changeTableUnitable_changeBtn(0);
	else if (btn.hasClass("invalidUnit"))
		$changeTo = changeTableUnitable_changeBtn(1);
	else
		return;

	$.post(
		'phpTest.php',
		{ tableName: tableName, startId: startId, endId: endId, mode: "changeTableUnitable", isAdmin: 1, changeTo: $changeTo },
		function (result)
		{
			if (parseInt(result) == -1)
			{
				changeTableUnitable_changeBtn(($changeTo+1)%2);
				alert("실패: 알 수 없는 이유로 Unit 설정불가");
			}
		}
	);
}
function changeTableUnitable_changeBtn(changeTo)
{
	if (changeTo == 0)
	{
		$(".phpTableUnitColumn").removeClass("validUnit");
		$(".phpTableUnitColumn").addClass("invalidUnit");
	}
	else
	{
		$(".phpTableUnitColumn").removeClass("invalidUnit");
		$(".phpTableUnitColumn").addClass("validUnit");
	}
	return changeTo;
}
function changeTableInfo()
{
	if (tableName == null)
	{
		// I have to write some code here - add new table
		alert("실패: 아직 구현되지 않았음");
		return;
	}
	if ($("#tableInfo-table").data("value") == $("#tableInfo-table").val() && $("#tableInfo-db").data("value") == $("#tableInfo-db").val())
		return; // No change, do nothing.
	else
	{
		$.post(
			'phpTest.php',
			{ tableName: tableName, startId: startId, endId: endId, mode: "changeTableInfo", isAdmin: 1,
			beforeTableName: $("#tableInfo-table").data("value"),
			afterTableName: $("#tableInfo-table").val(),
			beforeDBName: $("#tableInfo-db").data("value"),
			afterDBName:$("#tableInfo-db").val() },
			function (result)
			{
				if (parseInt(result) == 0)
				{
					alert("성공: 페이지를 새로고침합니다");
					location.reload();
					return;
				}
				else if (parseInt(result) == -1)
				{
					alert("실패: 알 수 없는 이유로 설정불가");
				}
				else if (parseInt(result) == -2)
				{
					alert("실패: 심각할 수 있는 에러로 설정불가 - 관리자 문의바람");
				}
			}
		);
	}
	$("#tableInfo-table").data("value");
	$("#tableInfo-db").data("value");
}
function showAllTables()
{
	$.post('showAllTables.php', function (result)
	{
		for(var i = 0; i < result.length; i++)
		{
			$("#SideNav ul").append('<li><a data-db='+result[i][0]+' data-tableorder='+result[i][2]+' data-hasUnit='+result[i][3]+' data-visible='+result[i][4]+' data-maxID='+result[i][5]+'>'+result[i][1]+'</a></li>');
		}

		$("#SideNav li").addClass('cursor noOutline noTapHighlight');
		$("#SideNav div").addClass('cursor noOutline noTapHighlight');
		$("#SideNav li a").click(function ()
		{
			$("#HeaderSubTitle").text($(this).text());
			$("#tableInfo-table").val($(this).text());
			$("#tableInfo-db").val($(this).data("db"));
			$("#tableInfo-table").data("value", $(this).val());
			$("#tableInfo-db").data("value", $(this).val());
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
function startSearching()
{
	if ($("#SearchBox_input input").val().length == 0)
		return;

	var queryMode = "findWord_by" + $("#SearchBoxDropdown span").text();

	$.post(
		'phpTest.php',
		{ tableName: tableName, startId: 0, endId: 0, mode: queryMode, isAdmin: 1,
			searchingText: $("#SearchBox_input input").val()
		},
		function (resultID)
		{
			if (parseInt(resultID) == 0)
				alert("검색 결과 없음\nNo result");
			else
			{
				startId = parseInt(parseInt(resultID - 1) / numberOfResult) * numberOfResult + 1;
				endId = startId + numberOfResult - 1;
				requestWord(resultID);
			}
		}
	);
}
function startAdding()
{
	if ($("#AddBox input:eq(0)").val().length
	* $("#AddBox input:eq(1)").val().length
	* $("#AddBox input:eq(2)").val().length
	* $("#AddBox input:eq(3)").val().length == 0)
	{
		alert("실패: 올바른 값을 입력하세요");
		return;		
	}

	var id = parseInt($("#AddBox_ID").val());
	if (isNaN(id))
	{
		alert("실패: ID 입력 오류");
		return;
	}
	
	var queryMode = "addNewRecord";
	$.post(
		'phpTest.php',
		{ tableName: tableName, startId: 0, endId: 0, mode: queryMode, isAdmin: 1,
			addingUnit: $("#AddBox input:eq(0)").val(),
			addingID: id,
			addingWord: $("#AddBox input:eq(2)").val(),
			addingMean: $("#AddBox input:eq(3)").val()
		},
		function (resultID)
		{
			if (parseInt(resultID) <= 0)
				alert("추가 실패: 알 수 없는 에러");
			else
			{
				startId = parseInt(parseInt(resultID - 1) / numberOfResult) * numberOfResult + 1;
				endId = startId + numberOfResult - 1;
				requestWord(resultID);
				maxID++;
				$("#phpTable").data("maxid", maxID);
			}
		}
	);
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
	$("#AddButton").css("bottom", "");
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
	{
		showOverlay();
	}
	else if (overlayIsOn == 0)
	{
		removeOverlay();
	}
}
function removeSearchButtonContainer()
{
	$("#SearchBox input").val("");
	$("#SearchButtonContainer").css("transform", "translateY(100%)");
	$("#SearchButton").css("bottom", "");
	$("#AddButton").css("bottom", "");
}

$(document).ready(function ()
{
	showAllTables();
	$("#tableInfo-summit").click(changeTableInfo());
	$("#adminButton").click(function ()
	{
		window.location.href="index.html";
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
		$("#SearchBox").removeClass("removed");
		$("#AddButton").css("bottom", "-100%");
		$("#AddBox").addClass("removed");
		overlayIsOn = 1;
		changeOverlay();
	});
	$("#AddButton").click(function ()
	{
		$("#AddBox input").val("");
		$("#AddBox input:eq(1)").val(maxID + 1);
		$("#SearchButtonContainer").css("transform", "translateY(0px)");
		$("#SearchButton").css("bottom", "-100%");
		$("#SearchBox").addClass("removed");
		$("#AddButton").css("bottom", "-100%");
		$("#AddBox").removeClass("removed");
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
		{
			$("#SearchBoxSearch").click();
		}
	});
	$("#AddBoxAdd").click(function ()
	{
		startAdding();
		removeSearchButtonContainer();
		overlayIsOn = 0;
		changeOverlay();
	});	

	removeSearchButtonContainer();
});
