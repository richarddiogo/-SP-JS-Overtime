var overtime = (function(){
	"use strict";
	var module = {};
	//max hora de pedido de hora extra
    var configMaxHour = {'setHours':14,'setMinutes':59,'setMilliseconds':0};
	var currentUser = "";
	var clientContext = "";
	var $inputPeople ,$divError,$dropdownStatus,$inputdate,$selectsDate;
	
	//test ativo
	var isTest = true;
	
	module.init = function() {
		$inputPeople = $('[title="Seletor de Pessoas"]');
		$divError = $('.AlertHour');
		$dropdownStatus = $('[title*="Status"]');
		$inputdate = $('#dtInit,#dtEnd').find('input');
		$selectsDate = $('#dtInit,#dtEnd').find('select');
		
		module.checksHour();
		
		if(!isGestor){
			$dropdownStatus.val('aprovado');
		}else{
			 module.getNameUser();
		}
	};
	
	module.getNameUser = function(){
	    clientContext = new SP.ClientContext.get_current();
	    var oWeb = clientContext.get_web();
	    currentUser = oWeb.get_currentUser();
	    clientContext.load(currentUser);
	    clientContext.executeQueryAsync(Function.createDelegate(this,module.onQuerySucceeded), Function.createDelegate(this,module.onQueryFailed));
	}

	module.onQuerySucceeded = function() {
	     overtime.getGestor(currentUser.get_loginName());
	}

	module.getGestor = function(userName){
	
		if(isTest){
			userName = "APSEN\\adhemir.aguiar";
		}
		
		var requestHeaders = {
			"Accept": "application/json;odata=verbose",
			"X-RequestDigest": jQuery("#__REQUESTDIGEST").val()
		};

		 jQuery.ajax({
			url: _spPageContextInfo.webAbsoluteUrl+"/_api/SP.UserProfiles.PeopleManager/GetPropertiesFor(accountName=@v)?@v='"+userName+"'",
			type:"POST",
			contentType : "application/json;odata=verbose",
			headers: requestHeaders,
			success:function(data){
				var Manager = "";
				var properties = data.d.UserProfileProperties.results;  
	                for (var i = 0; i < properties.length; i++) {  
	
	                    if (properties[i].Key == "Manager") {  
	                        Manager= properties[i].Value; 
	                        $inputPeople.html(Manager); 
	                    }  
	                }  
			},
			error:function(jqxr,errorCode,errorThrown){
				jqxr.responseText;
			}
		});
	}

	
	module.checksHour = function(dt){
		var maxHour = new Date();
		maxHour.setHours(configMaxHour.setHours);
		maxHour.setMinutes(configMaxHour.setMinutes);
		maxHour.setMilliseconds(configMaxHour.setMilliseconds);
		
		var currentHour = new Date();
		if(dt){
			currentHour = dt.init;
		}
		
		if(currentHour.toLocaleDateString() == maxHour.toLocaleDateString() && currentHour > maxHour){
			$divError.show();
			return false;
		}else{
			$divError.removeClass('AlertInput');
			return true;
		}
	}
	
	module.getDate = function(date){
			//pega as datas nos inputs
			var iniHour,endHour,iniMin,endMin,iniDay,iniMonth,iniYear,endDay,endMonth,endYear;

  			try{
	  			iniHour = parseInt(date.split('-')[2].split(':')[0],10);
	  			endHour = parseInt(date.split('-')[2].split(':')[1],10);
	  			iniMin = parseInt(date.split('-')[3].split(':')[0],10);
	  			endMin = parseInt(date.split('-')[3].split(':')[1],10);
  			}catch(ex){}
  			
  			try{
  				iniDay = date.split('-')[0].split('/')[0]
  				iniMonth = date.split('-')[0].split('/')[1]
  				iniYear = date.split('-')[0].split('/')[2]
  				endDay = date.split('-')[1].split('/')[0]
  				endMonth = date.split('-')[1].split('/')[1]
  				endYear = date.split('-')[1].split('/')[2]
  			}catch(ex){}
  			
  			var dateCurrentInit = new Date(iniYear,iniMonth-1,iniDay,iniHour,iniMin); 
  			var dateCurrentEnd = new Date(endYear,endMonth-1,endDay,endHour,endMin);
  			
  			return {'init':dateCurrentInit,
  			         'end':dateCurrentEnd};
	}
	
	module.filterDate = function(){
		var dates = $inputDate;
		var selectsTime = $selectsDate;
				
		return dates[0].value+'-'+dates[1].value+'-'+selectsTime[0].value+selectsTime[1].value+'-'+selectsTime[2].value+selectsTime[3].value;
	}
	
	module.IsEmpty = function(string){
		return string == null || string == "" || string == undefined;
	};
	
	module.onQueryFailed = function(sender, args){
		alert('Request failed. ' + args.get_message() + '\n' + args.get_stackTrace());
	};
		
	return {
		init : module.init,
		checksHour : module.checksHour,
		getDate : module.getDate,
		filterDate : module.filterDate,
		getGestor : module.getGestor
		}
}());

$().ready(function(){

	$('#dtInit,#dtEnd').find('input,select').on('change',function(){
		if(!overtime.checksHour(overtime.getDate(overtime.filterDate()))){
			$(this).addClass('AlertInput');
		}else{
			$(this).removeClass('AlertInput');
		}
	})

	SP.SOD.executeFunc("sp.js");
	ExecuteOrDelayUntilScriptLoaded(overtime.init, "sp.js");

})


