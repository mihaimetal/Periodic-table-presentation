(function(){
	$.easing.easeOutBounce = function (x, t, b, c, d) {
        if ((t/=d) < (1/2.75)) {
            return c*(7.5625*t*t) + b;
        } else if (t < (2/2.75)) {
            return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
        } else if (t < (2.5/2.75)) {
            return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
        } else {
            return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
        }
    };
	$.easing.easeInBounce = function (x, t, b, c, d) {
        return c - $.easing.easeOutBounce (x, d-t, 0, c, d) + b;
    };
	$.easing.easeInOutBounce = function (x, t, b, c, d) {
        if (t < d/2) return $.easing.easeInBounce (x, t*2, 0, c, d) * .5 + b;
        return $.easing.easeOutBounce (x, t*2-d, 0, c, d) * .5 + c*.5 + b;
    };
}());

var app = (function(){
	var tablew = 18, tableh = 10;
	var tiles = 40+2;
	var jtabledata = {};
	var bubbles = [], maxbubbles = 8;
	var promises = [];
	var trigger = true;
	var lostfocus = false;
	var rand = function (min, max) {
		return Math.round(Math.random()* (max - min + 1)) + min;
	};
	var snd = null;
	var initTable = function(prom){
		var $thetable = $("#thetable");
		$.ajax({
			type: "GET",
			url: "res/periodic.xml",
			dataType: "xml",
			success: function(xml){
				var $tile;
				$(xml).find("ATOM").each(function(){
					var an = parseInt($(this).find("ATOMIC_NUMBER").text());
					jtabledata["a"+an] = {};
					jtabledata["a"+an].elem = {};
					jtabledata["a"+an].info = {};
					//jtabledata["a"+an].atom = {};
					var info = "<table>";
					var row1 = "", row2 = "";
					$(this).children().each(function(){
						var tagstr = this.tagName;
						tagstr = tagstr.replace(/_/g, " ");
						tagstr = tagstr.toLowerCase();
						tagstr = tagstr.charAt(0).toUpperCase() + tagstr.slice(1);
						var tagval = $(this).text();
						tagval = $.trim(tagval);
						var tagattr = $(this).attr("UNITS");
						if(tagattr) tagval += " " + tagattr;
						//replace(/^\s+|\s+$/g, '')
						//jtabledata["a"+an].atom[tagstr] = tagval;
						//jtabledata["a"+an].info += "<p>" + [tagstr] +": "+ tagval + "</p>";
						info += "<tr><td>"+tagstr+"<td>"+tagval+"</td></tr>";
					});
					info += "</table>";
					jtabledata["a"+an].info = info;
					//$("#an"+an).append("<div id='info_"+an+"' class='element-info'>"+info+"</div>");
					
					var offset = 0;
					if(an >= 2) offset += 16;
					if(an >= 5) offset += 10;
					if(an >= 13) offset += 10;
					if(an > 56) offset -= 14;
					if(an > 88) offset -= 14;
					if(an > 56 && an < 72) offset += 68;
					if(an > 88 && an < 104) offset += 68;
					var x = (an - 1 + offset) % tablew;
					var y = Math.floor((an - 1 + offset) / tablew);
					
					var tilecolors = {
						alkalimetals: {
							"pos":[[0,1,1,6]],
							"col": "#dc143c"
						},
						alkalineearthmetals: {
							"pos":[[1,1,1,6]],
							"col": "#ffe4b5"
						},
						lanthanides: {
							"pos":[[2,8,15,1]],
							"col": "#ffc0cb"
						},
						actinides: {
							"pos":[[2,9,15,1]],
							"col": "#ee82ee"
						},
						transitionmetals: {
							"pos":[[2,3,10,1], [2,4,10,1], [3,5,9,1], [3,6,5,1], [11,6,1,1]],
							"col": "#ff69b4"
						},
						posttransitionmetals: {
							"pos":[[12,2,1,4], [13,4,1,2], [14,5,1,1]],
							"col": "#4169e1"
						},
						metalloids: {
							"pos":[[12,1,1,1], [13,2,1,2], [14,3,1,2], [15,4,1,2]],
							"col": "#bdb76b"
						},
						othernonmetals: {
							"pos": [[0,0,1,1], [13,1,1,1], [14,1,1,2], [15,1,1,3]],
							"col": "#98fb98"
						},
						halogens: {
							"pos": [[16,1,1,5]],
							"col": "#f0e68c"
						},
						noblegases: {
							"pos": [[17,0,1,6]],
							"col": "#b0e0e6"
						}
					};
					var backcol = "#a9a9a9";
					for(var i in tilecolors){
						for(var j in tilecolors[i].pos){
							for(var k=0; k<tilecolors[i].pos[j][2]; k++){
								for(var l=0; l<tilecolors[i].pos[j][3]; l++){
									var curx = tilecolors[i].pos[j][0] + k;
									var cury = tilecolors[i].pos[j][1] + l;
									if(x === curx && y === cury){
										backcol = tilecolors[i].col;
									}
								}
							}
						}
					}
					jtabledata["a"+an].elem.x = x;
					jtabledata["a"+an].elem.y = y;
					jtabledata["a"+an].elem.backcol = backcol;
					jtabledata["a"+an].elem.an = an;
					jtabledata["a"+an].elem.sym = $(this).find("SYMBOL").text();
					jtabledata["a"+an].elem.name = $(this).find("NAME").text();
					
					prom.resolve();
					
				});
				var newelems = {
					"113": {
						"name": "Ununtrium",
						"sym": "Uut"
					},
					"114": {
						"name": "Ununquadium",
						"sym": "Uuq"
					},
					"115": {
						"name": "Ununpentium",
						"sym": "Uup"
					},
					"116": {
						"name": "Ununhexium",
						"sym": "Uuh"
					},
					"117": {
						"name": "Ununseptium",
						"sym": "Uus"
					},
					"118": {
						"name": "Ununoctium",
						"sym": "Uuo"
					}
				};
				var offset = 8;
				for(var i in newelems){
					var an = i;
					jtabledata["a"+an] = {};
					jtabledata["a"+an].elem = {x:(an - 1 + offset) % tablew, y:Math.floor((an - 1 + offset) / tablew), backcol: "#a9a9a9", an: an, sym:newelems[i].sym, name:newelems[i].name};
					jtabledata["a"+an].info = "<table>"
					+"<tr><td>"+"Name"+"<td>"+newelems[i].name+"</td></tr>"
					+"<tr><td>"+"Symbol"+"<td>"+newelems[i].sym+"</td></tr>"
					+"<tr><td>"+"Atomic number"+"<td>"+an+"</td></tr>"
					+"</table>";
				}
			}
		});
	};
	var initSound = function(prom){
		soundManager.flashVersion = 9;
		soundManager.preferFlash = true;
		soundManager.url = "lib/";
		soundManager.onready(function() {
			snd = soundManager.createSound({
				id:'podcast',
				url:"res/99percentInvisible_PeriodicTable.mp3",
				autoLoad: true,
				volume:79,
				onload: function(){
					snd.onposition(28000, function(e){
						if(!trigger) return;
						if($("#blackboard").position().top !== 8)
							$("#blackboard").animate({top:8}, 1000);
					});
					snd.onposition(30000, function(e){
						if(!trigger) return;
						$("#blackboard").find("p").remove();
						drawText("The periodic table of the elements", {left:true});
						drawText("- there are 118 known elements;", {top:true});
						drawText("- elements with similar properties are on the same column;");
					});
					snd.onposition(113000, function(e){
						if(!trigger) return;
						$("#blackboard").find("p").remove();
						drawText("Dmitri Mendeleev (1834 - 1907)", {left:true});
						drawText("- best design for a table of the chemical elements;", {top:true});
						drawText("- left gaps for future elements;");
						drawText("- could predict the properties of the undiscovered elements;");
					});
					snd.onposition(134000, function(e){
						if(!trigger) return;
						for(var i=0; i<15; i++){
							var an = rand(1,100);
							$("#a"+an).fadeOut(3000).delay(3000).fadeIn(3000);
						}
					});
					snd.onposition(165000, function(e){
						if(!trigger) return;
						$("#a31").fadeOut(3000).delay(3000).fadeIn(3000);
					});
					snd.onposition(254000, function(e){
						if(!trigger) return;
						$("#a117").fadeOut(3000).delay(3000).fadeIn(3000);
					});
					
					$(window).blur(function(){
					if(!snd.paused){
						lostfocus = true;
						$("#tube-plug").animate({top:-20});
						snd.pause();
					}
					});
					$(window).focus(function(){
						if(snd.paused && lostfocus){
							lostfocus = false;
							$("#tube-plug").animate({top:-100});
							snd.resume();
						}
					});
					snd.play({ whileplaying: function(){updatePlay(snd);} });
					
					prom.resolve();
				},
				onfinish: function(){
					snd.play({ whileplaying: function(){updatePlay(snd);} });
					updatePlay(snd, true);
				}
			});
			
		});
	};
	
	var updatePlay = function(that, now){
		if(that.position % 5000 > 4900 || now){
			var sndperc = that.position * 100 / that.duration;
			var liqheight = sndperc / 100 * (250-30-20);
			$("#tube1").find(".tube-liquid").animate({height:Math.round(liqheight)+30});
			//console.log("per", that.position, that.duration);
		}
		//$("#tube1").find(".tube-liquid").animate({height:});
	};
	
	var drawText = function(text, o){
		o = o || {};
		if($("#blackboard").position().top !== 8)
			$("#blackboard").animate({top:8}, 1000);
		var $bb = $("#blackboard");
		var $bbtext = $("<p style='margin: "+(o.top?10:0)+"px 0 0 "+(o.left?50:0)+"px;'></p>").appendTo($bb);
		for(var i=1; i<=text.length; i++){
			(function(i, $bbtext){
				var txtstr = text.substr(0, i-1)+"<span style='display:none;'>"+text.substr(i-1,1)+"</span>";
				$bb.queue(function(){
					$bbtext.html(txtstr);
					$bb.dequeue();
				});
				$bb.queue(function(){
					$bbtext.find("span").fadeIn(180, function(){$bb.dequeue()});
				});
			}(i, $bbtext));
		}
	};
	
	var initBubbles = function(){
		for(var i=0; i<maxbubbles; i++){
			var $bubble = $("<div class='bubble' id='bubble"+i+"'></div>");
			$bubble.appendTo("#tube1");
			(function($bubble){
				setTimeout(function(){startBubbles($bubble)}, rand(100, 3000));
			}($bubble));
		}
		
	};
	
	var startBubbles = function($bubble){
		var bubx = rand(15,45), buby = rand(5,10);
		var bubs = rand(5,15);
		$bubble.css({left:bubx, bottom:buby, width:bubs, height:bubs});
		$bubble.css({"background": "#ffe4e1", "border-radius":Math.round(bubs/2), "opacity":"0.8"});
		$bubble.css({"background": "-webkit-gradient(radial, 20% 20%, 1, center center, "+Math.round(bubs/2)+", from(rgba(255,255,255,0.9)), color-stop(70%, rgba(255,255,255,0)), color-stop(99%, rgba(255,255,255,0.8)), to(rgba(255,255,255,0)))"});
		//$bubble.css({"background": "-moz-radial-gradient(20% 20% 45deg, circle contain, rgba(255,255,255,0.6) 70%, rgba(255,255,255,0) 99%"});
		$bubble.css({"background": "-moz-radial-gradient(top left, rgba(255,255,255,0.8), rgba(255,255,255,0))"});
		$bubble.animate({left:rand(15,45), bottom:$("#tube1 .tube-liquid").height()}, {duration:9000+rand(500, 5000), specialEasing:{left:Math.random() > 0.5 ? "easeInBounce" : "easeOutBounce"}, complete: function(){
			setTimeout(function(){startBubbles($bubble)}, rand(300, 2000));
		}});
	};
	
	var startApp = function(){
		$("#testtubes").find("div.tube").each(function(){
			for(var i=0; i<9; i++){
				//console.log('bottom:"+(i*25+20)+"px;left:0px;width:"+(i%2===0)?12:6+"px;');
				var gw = (i%2===0) ? 16 : 6;
				var sp = (i%2===0) ? "<span>"+((i+1)-i/2)+"</span>" : "";
				var id = "", curs = "";
				if($(this).attr("id") === "tube2"){
					id = "id='vol"+(i+1)*10+"' ";
					curs = "cursor:pointer;";
				}
				$(this).append("<div "+id+"class='grad' style='bottom:"+(i*25+30)+"px;left:13px;width:"+gw+"px;"+curs+"'>"+sp+"</div>");
			}
		});
		initSound(promises[0]=$.Deferred());
		initTable(promises[1]=$.Deferred());
		
		$("#tube2").find(".grad").click(function(e){
			var vol = parseInt(this.id.substr(3));
			snd.setVolume(vol);
			var newclass = "liquid-vol1";
			if(vol === 80)
				newclass = "liquid-vol2";
			else if(vol === 90)
				newclass = "liquid-vol3";
			$("#tube2").find(".tube-liquid").removeClass("liquid-vol1 liquid-vol2 liquid-vol3").addClass(newclass).animate({height:parseInt($(this).css("bottom"))});
		});
		
		$("#tube-plug").click(function(){
			var $this = $(this);
			if($this.is(":animated"))
				return;
			var out = ($this.position().top === -100);
			if(out)
				snd.pause();
			else
				snd.resume();
			$this.animate({top:out?-20:-100});
		});
		
		$.when.apply(null, promises).done(function(){
			$("#loading").remove();
			$("#periodictable").fadeIn();
			//var tilestr = "<div class='tile' id='a"+an+"' style='left:"+x*tiles+"px; top:"+y*tiles+"px;background:"+backcol+"'>"+an+"<p>"+$(this).find("SYMBOL").text()+"</p>"+$(this).find("NAME").text()+"</div>";
			//$thetable.append(tilestr);
			var promises2 = [];
			var n = 0;
			for(var i in jtabledata){
				(function(atom, prom){
					$("#thetable").queue(function(){
						var $tile = $("<div class='tile' id='a"+atom.elem.an+"' style='left:"+atom.elem.x*tiles+"px;top:0px;background:"+atom.elem.backcol+";'>"+atom.elem.an+"<p>"+atom.elem.sym+"</p>"+atom.elem.name+"</div>");
						$("#thetable").append($tile);
						$tile.animate({top:atom.elem.y*tiles}, 150, "linear", function(){ $("#thetable").dequeue(); prom.resolve();});
					});
				}(jtabledata[i], promises2[n]=$.Deferred()));
				n++;
			}
			
			$.when.apply(null, promises2).done(function(){
				$("#thetable").append("<div class='tile no-hover' style='left:84px;top:210px;background:transparent;text-align:center;font-size:16px;line-height:40px;'>*</div>");
				$("#thetable").append("<div class='tile no-hover' style='left:84px;top:252px;background:transparent;text-align:center;font-size:16px;line-height:40px;'>**</div>");
				$("#thetable").append("<div class='tile no-hover' style='left:46px;top:336px;background:transparent;text-align:center;font-size:16px;line-height:40px;'>*</div>");
				$("#thetable").append("<div class='tile no-hover' style='left:46px;top:378px;background:transparent;text-align:center;font-size:16px;line-height:40px;'>**</div>");
				$("#thetable").find(".tile").find("p").click(function(){
					window.open("http://en.wikipedia.org/wiki/" + jtabledata[$(this).parent()[0].id].elem.name);
				});
				$("#tube1").find(".tube-mark").fadeIn().click(function(){
					trigger = false;
					setTimeout(function(){trigger=true;}, 500);
					$("#blackboard").clearQueue().find("p").remove();
					snd.setPosition(parseInt(this.id.substr(2)));
					updatePlay(snd, true);
				});
				
				$("#thetable").find(".tile").hover(function(e){
					if($(this).hasClass("no-hover")) return;
					$(this).find("p").css({"color": "lime"});
					$("#element-info").css({"left": jtabledata[this.id].elem.x > 8 ? 0 : "auto", "right": jtabledata[this.id].elem.x > 8 ? "auto" : 0}).html(jtabledata[this.id].info).show();
				}, function(){
					if($(this).hasClass("no-hover")) return;
					$(this).find("p").css({"color": "#ffd700"});
					$("#element-info").hide();
				});
				initBubbles();
			});
		});
	};
		
	return {
		start: function(){
			startApp();
		}
	};
}());