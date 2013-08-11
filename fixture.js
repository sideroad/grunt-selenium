(function($){
	$(function(){
		$("#name").change(function(){
			$("#name-hidden").val(this.value);
			$("#name-span").text(this.value);
		});

		$("#generate-element").click(function(){
			setTimeout(function(){
				$("<span class='generatted-span'>Generatted</span>").appendTo(document.body);
			},1000);
		});

		$("#delete-element").click(function(){
			setTimeout(function(){
				$("#delete-target").remove();
			}, 1000);
		});

		$("#alert").click(function(){
			alert("Alert!");
		});

		$("#prompt").click(function(){
			prompt("Input something");
		});

		$("#toggle").click(function(){
			setTimeout(function(){
				$("#toggled-target").toggle();
			}, 1000);
		});
	});
})(jQuery);