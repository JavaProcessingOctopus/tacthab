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
        this.bricks = {}
	
	$http.get("/getContext").success(function(data){
			  console.log("DATA", data);
			
                          var i;
                          for(i in data.bricks) {
                            ctrl.bricks[i] = data.bricks[i];
                          }

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
		});
}).directive("mediaExplorer", function (){
	return {
		  restrict	: 'E'
		, templateUrl	: "/projetIHM/templates/mediaExplorer.html"
		, scope		: {
			  bricks 	: "=bricks"
			, title 	: "@title"
		}
		,controllerAs	: "controller"
		,controller 	: function($scope) {
			var controller    = this;
                        this.mediaServers = {};
                        for(brick in $scope.bricks){
                          if($scope.bricks[brick].type[2] === "BrickUPnP_MediaServer"){
                            this.mediaServers[brick] = $scope.bricks[brick];
                          }
                        }
			this.containers   = [];
			this.medias       = [];
			this.breadCrumb   = [{label: "Serveurs"}];
			this.goto	  = function(item) {
				 var pos = controller.breadCrumb.indexOf(item);
				 // Update remated data
                                   for(attr in controller.breadCrumb[pos]){
                                     controller[attr] = controller.breadCrumb[pos][attr];
                                   }
				 // Update breadcrumb
				 controller.breadCrumb.splice(pos, controller.breadCrumb.length);
				}
			this.Browse = function(mediaServer, container){
				this.breadCrumb.push( { label: container ? container.title : mediaServer.name
									  , mediaServers	: this.mediaServers
									  , containers 		: this.containers
									  , medias 		: this.medias
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
                                                                                console.log(doc)
										 if (  doc 
										 	&& (Result = doc.querySelector("Result"))
										 	) {
										 	var docResult = parser.parseFromString(Result.textContent, "text/xml");
                                                                                          console.log("docRESULT : ", docResult)
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
                                                                                                 var mediasXML = docResult.querySelectorAll("item");
                                                                                                 console.log(mediasXML)
                                                                                                 var title;
                                                                                                 var author; 
                                                                                                 var art;
                                                                                                 for(i=0 ; i< mediasXML.length ; i++){
                                                                                                   title = mediasXML[i].querySelector("title");
                                                                                                   author = mediasXML[i].querySelector("creator");
                                                                                                   art = mediasXML[i].querySelector("albumArtURI");
                                                                                                   controller.medias.push(
                                                                                                       {
                                                                                                         id: mediasXML[i].getAttribute("id"),
                                                                                                         title : title ? title.textContent : "Unknown",
                                                                                                         author : author ? author.textContent : "Unknown",
                                                                                                         img: art ? art.textContent : "Unknown"
                                                                                                       }
                                                                                                       )
                                                                                                 }

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
}).directive("mediaPlayer", function(){
	return {
		restrict:'E'
		,templateUrl: "/projetIHM/templates/mediaPlayer.html"
		,scope:{
			bricks:"=bricks"
			,title:"@title"
		}
		,controllerAs: "mediaPlayerController"
		,controller:function($scope){
			var controller    = this;
                        this.mediaRenderers = {};
                        for(brick in $scope.bricks){
                          if($scope.bricks[brick].type[2] === "BrickUPnP_MediaRenderer"){
                            this.mediaRederers[brick] = $scope.bricks[brick];
                          }
                        }
			this.Browse = function(mediaServer, container){
				this.mediaServers = [];
				this.containers   = [];
				this.medias       = [];
				console.log("Browse dans la brick",mediaServer, containerId);


		        }
	      }
        }
});
