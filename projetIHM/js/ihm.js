/**
 * Created by sonina on 22/10/15.
 *anguloarjs material à installer avec bower
 */
 var utils = require("../../js/utils.js");
 utils.initIO(location.host + "/m2m");
 var parser = new DOMParser();
 
angular.module("projetmm",["ngMaterial","angular-toArrayFilter"])
		.controller("mmcontroller", 
function($http, $scope){
	var ctrl = this;

	
	$http.get("/getContext").success(function(data){
			    console.log(data);
			ctrl.bricks = data.bricks;
			utils.io.on("brickAppears",
				function(data){
					console.log("brickAppears", data);
					ctrl.bricks[data.id]= data;
					$scope.$apply();
				});
			utils.io.on("brickAppears",
				function(data){
					console.log("brickDisappears", data);
					delete ctrl.bricks[data.brickId];
					$scope.$apply();
				});
			data.bricks.tot={name:"Flo", iconURL:"https://upload.wikimedia.org/wikipedia/en/8/84/Flo_from_Progressive_Insurance.jpg"}
		});


}).directive("mediaExplorer", function (){
	return {
		  restrict		: 'E'
		, templateUrl	: "/projetIHM/templates/mediaExplorer.html"
		, scope			: {
			  bricks 	: "=bricks"
			, title 	: "@title"
		}
		,controllerAs	: "controller"
		,controller 	: function($scope) {
			var controller = this;
			this.mediaServers = $scope.bricks;
			this.containers   = [];
			this.medias       = [];
			this.breadCrumb   =	[ {label: "Serveurs"}
								];
			this.goto	= function(item) {
				 // Update breadcrumb
				 var pos = this.breadcrumb.indexOf(item);
				 this.breadcrumb.splice(pos+1, this.breadcrumb.length);
				 // Update remated data

				}
			this.Browse = function(mediaServer, container){
				this.breadCrumb.push( { label: container?container.title:mediaServer.name
									  , mediaServers	: this.mediaServers
									  , containers 		: this.containers
									  , medias 			: this.medias
									  } 
									);

				var containerId = container?container.id:"0";
				this.currentServer= mediaServer;
				this.mediaServers = [];
				this.containers   = [];
				this.medias       = [];
				console.log("Browse dans la brick",mediaServer, containerId);

				utils.call	( mediaServer.id
							, "Browse"
							, [containerId]
							).then	( function(res) {
										 console.log("Browse => ", res);
										 var doc = parser.parseFromString(res, "text/xml")
										   , Result;
										 if (  doc 
										 	&& (Result = doc.querySelector("Result"))
										 	) {
										 	var docResult = parser.parseFromString(Result.textContent, "text/xml");
										 	if(docResult) {
										 		// Mise à jour des containers
										 		var containersXML = docResult.querySelectorAll( "container" );
										 		var i;
										 		for(i=0; i<containersXML.length; i++) {
										 			controller.containers.push(
										 				{ id 	: containersXML[i].getAttribute("id")
										 				, title : containersXML[i].querySelector("title").textContent
										 				}
										 				);
										 			}

										 		 // Mise à jour des médias
										 		 // ...

										 		 // Met à jour l'affichage
										 		 $scope.$apply(); // Forcer la synchronisation du HTML avec les données via Angular...
										 		}
										 	} else {console.error("Problem parsing <Result> ...")}
										 }
									);
			}
		}
	}
}).directive("server", function (){
	return {
		restrict:'E'
		,templateUrl:"js/template.html"
		,scope:{
			bricks:"=bricks"
			,title:"@title"
		}
		,controllerAs:"mc"
		,controller:function($scope){
			this.breadCrumb=[];
		}
	}
});