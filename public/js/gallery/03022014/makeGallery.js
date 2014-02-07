(function() {

  var noMakesHTML = '<p class="make-no-results"><strong>Sorry!</strong> We couldnt find any makes that match your search.</p>';

  var makeHTML = '' +
' <div class="make-node">' +
' <div class="make-node-inner">' +
'    <a href="#" class="make-link">' +
'      <div class="make-thumbnail"></div>' +
'    </a>' +
'    <div class="make-details">' +
'      <h1>' +
'        <a href="#" class="make-details-link"></a>' +
'      </h1>' +
'      <p class="make-meta">' +
'        <img class="make-user-avatar">' +
'        <span class="make-meta-author">Created by <a href="#" class="make-details-user">@flukeout</a></span>' +
'        <span class="make-meta-timestamp"><span class="make-details-timestamp"></span> ago</span>' +
'<span class="make-likes">,'+
'         <span class="make-likes-count"></span> like</span>' +
'        </span>'+
'     </p>' +
'     <p class="make-description"></p>' +
'      <div class="make-tags"></div>' +
'      </div>' +
'      <div class="button-container">' +
'        <a href="#" class="make-remix">' +
'          <span class="icon-remix"></span>' +
'          Remix' +
'        </a>' +
'      </div>' +
'    </div>';

  var galleryElement;

  var minWidth = 250;       //Minimum width of a Gallery item
  var DEFAULT_LIMIT = 10;   //Default result limit

  var resizeDelay = 25;

  var MakeAPIURL = "https://makeapi.webmaker.org";
  var MakeAPI = window.Make;

  var default_profileBaseURL = "https://webmaker.org/u/";
  var fallbackAvatar = "https://i1.wp.com/stuff.webmaker.org/avatars/webmaker-avatar-44x44.png";

  var delayer;
  window.onresize = function resizeTracker() {
    if(delayer) {
      window.clearTimeout(delayer);
    }
    delayer = window.setTimeout(fixHeights,resizeDelay);
  };

  function generateNode(make,clientConfig) {

    // var stuffToKeep = {
    //   "thumbnail" : function(blam){
    //
    //   }, etc...
    // }
    // Later iterate over the array of things to keep and run the above.!

    var node = document.createElement("div");
    node.innerHTML = makeHTML;
    node = node.querySelector(".make-node");
    var hidden = clientConfig.hidden || [];

    //Thumbnail Image
    var thumb = node.querySelector(".make-thumbnail");
    if(hidden.indexOf("thumbnail") < 0) {
      var thumbLink = node.querySelector(".make-link");
      thumbLink.setAttribute("href", make.url);
      if(make.thumbnail) {
        thumb.style.backgroundImage = "url(" + make.thumbnail + ")";
      } else {
        if(clientConfig.fallbackThumbnail) {
          thumb.style.backgroundImage = "url("+clientConfig.fallbackThumbnail+")";
        } else {
          thumb.classList.add("default-thumbnail");
        }
      }
    } else {
      thumb.parentNode.removeChild(thumb);
    }

    //Title link
    var link = node.querySelector("h1 a");
    if(hidden.indexOf("title") <0 ) {
      link.setAttribute("href",make.url)
      link.innerHTML  = make.title;
    } else {
      link.parentNode.removeChild(link);
    }

    if(hidden.indexOf("created-by") < 0){
      var user = node.querySelector(".make-details-user");
      user.innerHTML =  make.username;
      var userURL = clientConfig.profileBaseURL || default_profileBaseURL;
      user.setAttribute("href",userURL + make.username);
    } else {
      var userWrapper = node.querySelector(".make-meta-author");
      userWrapper.parentNode.removeChild(userWrapper);
    }

    //Created At
    if(hidden.indexOf("created-at") < 0){
      var createdAt = node.querySelector(".make-details-timestamp");
      var createdTime = new Date(make.createdAt);
      var currentTime = new Date().getTime();
      var timeDelta = currentTime - createdTime;
      var day = 1000* 60 * 60 * 24;

      var days = Math.floor(timeDelta/day);
      var months = Math.floor(days/31);
      var years = Math.floor(months/12);

      var dateString;

      if(days > 50) {
        if(months > 12) {
          dateString = years + " years";
        } else {
          dateString = months + " months";
        }
      } else {
        dateString = days + " days";
      }
      createdAt.innerHTML = dateString;

    } else {
      var createdAt = node.querySelector(".make-meta-timestamp");
      createdAt.parentNode.removeChild(createdAt);
    }


    //Like count
    var likesWrapper = node.querySelector(".make-likes");
    if(hidden.indexOf("likes-count") < 0) {
      var likeCount = node.querySelector(".make-likes-count");
      likeCount.innerHTML = make.likes.length;
      if(make.likes.length == 0) {
        likesWrapper.style.display = "none";
      }
      if(make.likes.length > 2) {
        likesWrapper.innerHTML = likesWrapper.innerHTML + "s";
      }
    } else {
      likesWrapper.parentNode.removeChild(likesWrapper);
    }

    //Descripiton
    var description = node.querySelector(".make-description");
    if(hidden.indexOf("description") < 0){
      description.innerHTML = make.description;
    } else {
      description.parentNode.removeChild(description);
    }

    //Remix Button
    var remix = node.querySelector(".make-remix");
    if(hidden.indexOf("remix-button") < 0){
      remix.setAttribute("href",make.remixurl);
    } else {
      remix.parentNode.removeChild(remix);
    }



    //Remix Button
    var like = node.querySelector(".make-like");
    if(hidden.indexOf("like-button") < 0){

    } else {
      like.parentNode.removeChild(like);
    }

    var avatar = node.querySelector(".make-user-avatar");
    if(hidden.indexOf("author-picture") < 0){
      if(!clientConfig.fallbackAvatar) {
        clientConfig.fallbackAvatar = fallbackAvatar;
      }
      var avatarSrc = "http://www.gravatar.com/avatar/" + make.emailHash + "?s=44&d=" + encodeURIComponent(clientConfig.fallbackAvatar);
      avatar.setAttribute("src", avatarSrc);
    } else {
      avatar.parentNode.removeChild(avatar);
    }

    //Generate tags
    var makeTags = node.querySelector(".make-tags");
    if(hidden.indexOf("tags") < 0) {
      for(var i = 0; i < make.tags.length; i++){
        var tag = document.createElement("a");
        tag.classList.add("make-tag");
        tag.innerHTML = make.tags[i];
        tag.setAttribute("href","https://webmaker.org/t/" + make.tags[i]);
        makeTags.appendChild(tag);
        makeTags.innerHTML = makeTags.innerHTML + " ";
      }
    } else {
      makeTags.parentNode.removeChild(makeTags);
    }

    return node;
  }

  function build( rootElement, makes,clientConfig) {
    makes.forEach(function(make) {
      rootElement.appendChild(generateNode(make,clientConfig));
    });
    fixHeights();
  }

  function countRowItems(){
    var galleryWidth = galleryElement.offsetWidth;
    return Math.floor(galleryWidth/minWidth);
  }

  function fixHeights(){

    var columnCount = countRowItems();
    galleryElement.setAttribute("data-cols",columnCount);

    var makeEls = galleryElement.querySelectorAll(".make-node");
    var lastTop;
    var tallest = 0;
    var itemsPerRow = countRowItems();
    var rowItem = 0;
    var currentRow = 1;
    var rowCount = Math.ceil(makeEls.length / itemsPerRow);

    for(var i = 0; i < rowCount; i++){

      tallest = 0;

      //Figure out tallest Make in each row
      for(var j = 0; j < itemsPerRow; j++){
        var makeIndex = j + (i*itemsPerRow);
        var makeEl = makeEls[makeIndex];
        if(makeEl){
          makeDetails = makeEl.querySelector(".make-details");
          makeDetails.style.height = "";
          var height = makeDetails.offsetHeight;
          if (height > tallest){
            tallest = height;
          }
        }
      }

      //Set each make to the tallest in that row
      tallest = tallest - 50;
      for(var j = 0; j < itemsPerRow; j++){
        var makeIndex = j + (i*itemsPerRow);
        var makeEl = makeEls[makeIndex];
        if(makeEl){
          makeEl.querySelector(".make-details").style.height = tallest + "px";
        }
      }


    }





  }

  function MakeGallery(query, clientConfig) {

    clientConfig.apiURL = MakeAPIURL;
    var element = clientConfig.elementSelector;

    galleryElement = document.querySelector(element);

    galleryElement.innerHTML =  noMakesHTML;

    if(!galleryElement.classList.contains("make-gallery")) {
      galleryElement.classList.add("make-gallery");
    }

    galleryElement.style.backgroundColor = clientConfig.backgroundColor;

    var self = this;

    this.element = typeof element === "string" ? document.querySelector( element ) : element;

    if ( !element ) {
      throw new Error( "you must provide an element or selector for the gallery" );
    }

    if ( !clientConfig ) {
      throw new Error( "you must provide a MakeAPI client Configuration object" );
    }

    var makeClient = new MakeAPI(clientConfig);
    query.limit = query.limit ? query.limit : DEFAULT_LIMIT;
    makeClient.find(query).then(function(err,makes,count ) {
    if (err) { throw err;}

    if ( count ) {
      build( self.element, makes, clientConfig );
    } else {
        // Put up a sweet message
        // what do we do for no makes?
        // Cry.
        // Add a 0 makes found thingy
    }

  });

    return this;
  }

  // Depending on the environment we need to export our "Make" object differently.
  if ( typeof define === "function" && define.amd ) {
    // Support for requirejs
    define(function() {
      return MakeGallery;
    });
  } else {
    window.MakeGallery = MakeGallery;
  }

})();
