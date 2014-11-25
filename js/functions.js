if(jQuery){(function(e){e.fn.fixClick=function(t,n){var r=this;r.click=t;r.dblclick=n;r.timer=null;e(this).unbind("click.fixclick").unbind("dblclick.fixclick").on("click.fixclick",function(n){var i=this;i.e=n;if(!r.timer){r.timer=setTimeout(function(){t.call(i,i.e);r.timer=null},e.fn.fixClick.clickDelay)}}).on("dblclick.fixclick",function(e){var t=this;clearTimeout(r.timer);r.timer=null;n.call(t,e)});return this};e.fn.fixClick.clickDelay=300})(jQuery)}

var gdata;
var months = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь']

$.fn.tmpl = function(tmplId, data, callback) {
	var t = this
	$.ajax({
		url: 'templates/' + tmplId + '.tmpl',
		cache: false,
	}).done(function(response){
		var script = $('<script type="text/x-dot-template" id="tmpl_' + tmplId + '"></script>').html(response).appendTo($('body'))
		
		var tmpl = doT.template($('#tmpl_' + tmplId).html())
		$('#tmpl_' + tmplId).remove()
		if (!$.isArray(data)) data = [data]
		
		return t.each(function() {
			var html = ''
			for (var itemIdx = 0; itemIdx < data.length; itemIdx++) {
				html += tmpl(data[itemIdx])
			}
			$(t).html(html)
			if(callback) callback()
		})
	})
}

function doprint(obj){
	if (!$('#forprint').get(0))	$('body').append("<iframe id='forprint' style='display:none'></iframe>")
	var win = $('#forprint').get(0).contentWindow
	$('#forprint').css({ width:0, height: 0, border : 'none' }).show()
	win.document.write('<html><head><link rel=\"stylesheet\" href=\"styles/style.css\" type=\"text/css\" /><body><table width=\"100%\" class=\"border1px\" style=\"border-collapse:collapse;\">' + obj.innerHTML + '</table></body></html>')
	win.document.close()
	win.focus()
	win.print()
}


var gobutton = function(obj, func, text){
	$(obj)
	.hide()
	.parent()
	.find('.sure')
	.stop(true, false).animate({width:'toggle'}, 100, function(){
		$(this).text(text ? text : 'delete')
	})
	.on('click', function(){
		 new Function(func)()
	}).mouseleave(function(){
		$(this).text('').stop(true, false).animate({width:'toggle'}, 100, function(){
			$(this).hide()
			$(obj).show()
		})
	})
}


var goprompt = function(title, text, args){
	$('#prompt').html(text).dialog({
		title : title, modal: true,
    	buttons: {
      		"Ok": function() {
				if(args)
					csend(args)
    		  	$(this).dialog("close")
      		},
	    	"Cancel": function() {
				$(this).dialog("close")
	    	}
    	}
	})
}

var csend = function(arg, callback){
	$('input, select').prop('disabled', function(){ return !$(this).prop('disabled') })
	$.ajax({
		dataType: 'json',
		type : 'post',
		url: 'data.php',
		data: arg,
		cache: false,
		success: function(response){
			gdata = response
  			$('#container').tmpl('maintemplate', gdata, function(){
				updateJs()
				if(callback && typeof(callback) == 'function')
					callback(arguments)
			})
			$('input, select').prop('disabled', function(){ return !$(this).prop('disabled') })
		},
		error : function(xdr, exception){
			alert(exception)
			if(callback && typeof(callback) == 'function')
				callback(arguments)
			$('input, select').prop('disabled', function(){ return !$(this).prop('disabled') })
		}
	})
}

var drawCalendar = function(index, year){
	var table = $('<table id="theT" align="center" width="100%">')
	var tr = $('<tr>').appendTo(table)
	var td = $('<td class="header">Сотрудник</td>').appendTo(tr)
	var syear = year
	
	for (month=1; month<=12; month++){
		var days_in_this_month = date("t", mktime(0, 0, 0, month, 1, syear))
		var current_month_name = months[(month-1)]
		
		var colweeks = 0
		var week_day = 0
		
		for (day_counter = 1; day_counter <= days_in_this_month; day_counter++) {
			week_day = intval(date("N", mktime(0, 0, 0, month, day_counter, syear)))
			if (week_day == 7) colweeks++
		}
		
		if(week_day > 1 && week_day < 3) colweeks++			
		if (month==12) colweeks++
		
		var td = $('<td class="header" colspan="' + colweeks + '">' + current_month_name + '</td>').appendTo(tr)
	}

	var syear = year
	for(user in gdata['rows']){
		var username = gdata['graph_users'][user]
		var tr = $('<tr class="user_row">').appendTo(table)
		var td = $('<td style="display:table; width:100%; border:none;" class="user"><div style="padding:0 .3em;">'+(username.length > 15 ? username.substring(0, 10)+'&hellip;':username)+'</div></td>').appendTo(tr)
		
		$('<div class="close deleteuser" />').on('click', function(){
			 goprompt('Внимание!', 'Вы действительно хотите удалить <b>'+username+'</b>?', {deletepeople:1,member:user,otdel:index,unit:username, index:index})
		}).appendTo(td)
		
		$('<div class="move moveuser" />').on('click', function(){
			$('#moveform').dialog({
				resizable: false, modal: true, title : 'Перемещение сотрудника',
				buttons: {
					"Ok": function() {
						csend({movepeople:1, member: user, otdel:$("#moveform option:selected").val(), name:username, index:index})
						$(this).dialog("close")
					},
					"Cancel": function() {
						$(this).dialog("close")
					}
				}
			})
		}).appendTo(td)
		
		
		var jan = false
		var first = 0
		for(month=1; month<=13; month++){
			var days_in_this_month = intval(date("t", mktime(0, 0, 0, (month==13 ? 1 : month), 1, (month==13 ? syear + 1 : syear))))
			var colweeks = 0
			

			for(var day_counter = 1; day_counter <= (month==13 ? 6 : days_in_this_month); day_counter++) {
				var week_day = date("N", mktime(0, 0, 0, month, day_counter, syear))
				if(week_day == 7){
					var dtid = user + "_" + (month==13 ? syear + 1 : syear) + "_" + (month==13 ? 1 : month) + "_" + colweeks
					var data = gdata['rows'][user][dtid] ? gdata['rows'][user][dtid] : null
					var datetooltip = ((first > day_counter)? months[month-2] : ((first == 0) ? months[11]:months[month-1])) + " " + ((first == 0) ? 32-(7-day_counter):first) + " - " + months[(month-1)] + " " + day_counter
					var td = $('<td class="sc' + ((data!=null)? ' active':'') + '" tt></td>').appendTo(tr)
					td.get(0).user = user
					td.get(0).sid = dtid
					td.get(0).data = data
					td.get(0).datetooltip = datetooltip
					
					td.on('click', function(){
						var sid = $(this).get(0).sid
						var suser = $(this).get(0).user
						$('#msgboxval').val($(this).get(0).data || '')
						
						$('#msgbox').dialog({
							resizable: false, modal: true, title : $(this).get(0).datetooltip,
							buttons: {
								"Ok": function() {
									csend({ storage:1, id_graph:sid, unit: suser, data:$(this).find('#msgboxval').val(), index:index })
									$(this).dialog("close")
								},
								"Cancel": function() {
									$(this).dialog("close")
								}
							}
						})
					})
					
					colweeks++
					first = ((day_counter == days_in_this_month) ? 1 : day_counter+1)
				}
				week_day++;
			}
			
			if (jan) break
		}
	}
	
	table.tooltip({
		items: '[tt]', show : 0, hide : 0, track: true,
		content: function() {
			return '<div style="white-space:nowrap;">' + $(this).get(0).datetooltip + ($(this).get(0).data ? '<div style="font:12px monospace; background:#777; color:#fff; padding:.5em; border:1px solid #aaa; margin-top:.5em;  white-space:pre;">' + $(this).get(0).data + '</div>':'') + '</div>'
		}
	})
	
	$('.tograph').empty()
	table.appendTo($('.tograph'))
}

var drawCalendarNoData = function(year){
	if($('#calendar').length && $('#calendar').attr('index')==year) {
		return
	}
	
	var holidays = [
		[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
		[0,0,1,1,1,1,1,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,1,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0],
		[0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0,1,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1],
	]
	
	var table = $('<table align="center" id="calendar" index="'+year+'">')
	
	var tr
	for(var month=1; month<=12; month++){
		var days_in_this_month = intval(date("t", mktime(0, 0, 0, month, 1, year)))
		var week_day = intval(date("N", mktime(0, 0, 0, month, 1, year)))
		if ((month-1)%4==0) 
			tr = $("<tr style='font-size:11px;'>").appendTo(table)

		var td = $("<td valign='top'>").appendTo(tr)
		var table2 = $("<table style='border-collapse:collapse;' class='border1px txtcontent'>").appendTo(td)
		$("<tr class='header'><td colspan='7'>" + months[month-1] + "</td></tr><tr class='thround'><td>Пн</td><td>Вт</td><td>Ср</td><td>Чт</td><td>Пт</td><td>Сб</td><td>Вс</td></tr>").appendTo(table2)
		var counter = 1
		var first = week_day
		var oct = week_day
		if (first > 1){
			var tr2 = $("<tr>").appendTo(table2)
			for(days = 1; days<first; days++) $("<td>&nbsp;</td>").appendTo(tr2)
		}
		
		var tr2
		for(days = first; days<=(days_in_this_month+oct-1); days++) {
			if (week_day==1) 
				tr2=$("<tr>").appendTo(table2)

			if (days==first){
				if (holidays[month][counter]==1){
					$("<td class='thround'>"+counter+"</td>").appendTo(tr2)
				} else if (holidays[month][counter]==-1 && (week_day==6 || week_day==7)){
					$("<td>"+counter+"</td>").appendTo(tr2)
				} else if (week_day==6 || week_day==7){
					$("<td class='thround'>"+counter+"</td>").appendTo(tr2)
				} else {
					$("<td class='border1px'>"+counter+"</td>").appendTo(tr2)
				}
				counter++
				first++
			}else{
				$("<td>&nbsp;</td>").appendTo(tr2)
			}
			week_day%=7
			week_day++
		}
	}
	
	$('.tocal').empty()
	table.appendTo($('.tocal'))
}

var updateJs = function(){
	$('.editheader').bind('change focusout keydown', function(e){
		if(!e.keyCode || (e.keyCode && (e.keyCode==13 || e.keyCode==27))){
			$(this).hide()
			$(this).parent().find('b, span').show()
			if($(this).val() != $(this).parent().find('b').text()){
				csend({ action:'edit_otdel', otdel_id:$(this).attr('data-id'), editname:$(this).val() })
			}
		}
	})
	
	$('.bheader').fixClick(function(){
		csend({action:'nav', id:$(this).attr('data-id'), pid:$(this).attr('data-pid') })
	},function(){
		if($(this).attr('data-pid')){
			$(this).parent().find('b, span').hide()
			$(this).parent().find('input').parent().show().find('input').focus().select()
		}
	})
	
	drawCalendar(gdata.index, gdata.year)
	drawCalendarNoData(gdata.year)
	
	$('.close').parent().append('<div class="sure roundcell" />')
	$('.sure').hide()
	
	$('body').tooltip({ show:0, hide:0, track: true })
	
}

$(function(){
	if(gdata=='undefined' || gdata==null) csend({ })
})