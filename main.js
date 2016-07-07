/**
 * Created by Mantock on 5/12/16.
 */
/*
 */

//Global Variables used to update content to respond to user choices.
//The choices that change these variables are:
//----Choosing a new venue
//----Choosing a new artist

var drop = true;
var yt_search_str = '';
var twitter_search_str = '';
var google_lat = 0;
var google_lon = 0;
var venue_name = 0;
var artist_pic_src = '';
var artist_bio = '';
var artist_disc = '';
var youtube_array = [];
var vid_index = 0;
var global_tour_dates = [];

$('.artist_list').on('keydown', function (event){
    var keycode = event.which;
    var key = keycode.keyCode;
    if (key == 13) {
        video_search
    }
});

$(document).ready(function() {
    $('#myModal').load('map2, pano2');
    $("#myModal").on("shown.bs.modal", function () {initialize();});

    $('#myCarousel').on('click', '.tour_date', function(){
        tour_date_click(this);
    });
   /* $( '#speaker_right').on('click','.next_vid', function(){
        console.log('BRUH');
        next_video();
    }); */
   /* $('#speaker_left').on('click', function(){
        prev_video();
    }); */
});

//function tour_date_click
//input: dom element that was clicked
//output: changes the global venue name and lat lon when clicked
function tour_date_click(clicked_element){
    // clicked_element = this;
    var a = clicked_element;
    var temp_venue = global_tour_dates[Number($(a).attr('data-id'))];
    google_lat = temp_venue.venue_lat_lon.lat;
    google_lon = temp_venue.venue_lat_lon.lon;
    venue_name = temp_venue.venue_name;
    $('#myModal .modal-dialog .modal-content .modal-header .modal-title').html(venue_name);
    initialize();
    //here is where we should update the google modal
}

//function dropdown:
//input: none
//output: creates a dropdown search bar underneath the main landing div
function dropdown() {
    if (drop == true) {
        var welcome_position = $('.landing_welcome').position().top;
            var welcome_height = $('.landing_welcome').height();
            var drop_div = $('<div>').addClass('drop_animate');
            var drop_text = $('<input>').addClass('artist_list').attr('onkeydown','page_scroll(event)');
            drop_text.attr('placeholder', 'search for artist by name');
            $(drop_div).append(drop_text);
            $('.landing_container').append(drop_div);
            $('.drop_animate').animate({top: welcome_position + welcome_height * 2 + 'px'}, 600, function () {
            });
        drop = false;
    }
}
//function page_scroll
//input: keyboard event
//output: main page will scroll up and calls on apis to update content and populate DOM elements
function page_scroll (event) {
    var key = event.which;
    if(key == 13) {
        populate_tour($('.artist_list').val());
        setTimeout(function () {
            video_search($('.artist_list').val());
        },1600);
    var xposition = $('#home_page').position().top;
    var xHeight = $('#home_page').height();


    $('.drop_animate').toggle('slow');
    $('#main_page').animate({top:(-1*xHeight) + 'px'},900, function() {
        twitter_feed_update($('.artist_list').val());
    })
    }

    // $('.next_vid').click( function(){
    //     console.log("IS this working");
    //
    //
    // });
}

//Create a Process for Twitter's API
//Input Raw Json from Twitter API
//Output Array of objects holding the info we need
//Info needed in each object user_pic  user_name  tweet_text  tweet_date
function process_twitter_api(response) {
    var tweet_array = [];
    var t_location = response.tweets.statuses;
    for (var i = 0; i < t_location.length ; i++){
        var new_tweet_obj = {};
        new_tweet_obj.text = t_location[i].text;
        new_tweet_obj.user_pic = t_location[i].user.profile_image_url;
        new_tweet_obj.user_name = t_location[i].user.screen_name;
        new_tweet_obj.date_created = t_location[i].created_at;
        tweet_array.push(new_tweet_obj);
    }
    console.log(tweet_array);
    twitterList(tweet_array);
    return tweet_array;
}

//function twitterList
//input: array of tweet objects containing information to build a tweet div
//output: The twitter feed on the right of the page is populated with tweets
function twitterList (tweet_object_array) {
    var temp_div = $('<div>').addClass('twitter_card');
    var temp_text = $('<div>').addClass('tweet_text');
    var temp_pic = $('<img>').addClass('tweet_user_pic');
    var temp_user_name = $('<div>').addClass('tweet_user_name');
    var temp_tweet_date = $('<div>').addClass('tweet_date');
    var tweet_icon = $('<i>').addClass('fa fa-twitter-square tweet_icon').attr('aria-hidden','true');
    var current_tweet = tweet_object_array[0];
    temp_text.html(current_tweet.text);
    temp_pic.attr('src', current_tweet.user_pic);
    console.log(tweet_object_array[0]);
    temp_user_name.html('@' + current_tweet.user_name);
    temp_tweet_date.html(current_tweet.date_created);
    temp_div.append(temp_pic, temp_user_name, temp_text, tweet_icon);
    $('.twitter_feed').append(temp_div);
    var counter = 1;

    for(i=1; i<tweet_object_array.length; i++) { //array should start at 1
        temp_div = $('<div>').addClass('twitter_card');
        temp_text = $('<div>').addClass('tweet_text');
        temp_pic = $('<img>').addClass('tweet_user_pic');
        temp_user_name = $('<div>').addClass('tweet_user_name');
        temp_tweet_date = $('<div>').addClass('tweet_date');
        tweet_icon = $('<i>').addClass('fa fa-twitter-square tweet_icon').attr('aria-hidden','true');
        current_tweet = tweet_object_array[i];
        temp_text.html(current_tweet.text);
        temp_pic.attr('src', current_tweet.user_pic);
        temp_user_name.html('@' + current_tweet.user_name);
        temp_tweet_date.html(current_tweet.date_created);
        temp_div.append(temp_pic, temp_user_name, temp_text, tweet_icon);
        var lastPosition = $('.twitter_feed .twitter_card:first-child').position().top;
        var lastHeight = $('.twitter_feed .twitter_card:first-child').height();
        $('.twitter_feed').append(temp_div.attr('data-count',counter).css({top: lastPosition + 15}));
        $('.twitter_feed div:last-child').animate({top:(lastHeight * counter) + (15 * counter++) + 'px'}, 1100);
    }
}

//tour_date_object constructor
//input: date object
//output: new tour_date object and corresponding DOM elements in carousel

function Tour_date(date_object, first, id){
    console.log('constructing new object');
    date_object;
    this.event_date = date_object.event_date;
    this.venue_city = date_object.city;
    this.venue_name = date_object.name;
    this.lat = date_object.lat_lon.lat;
    this.lon = date_object.lat_lon.lon;
    this.make_dom_object(first, id);
}
//update_globals function
//input: none
//output: Updates global google long/lat values based off of the properties of the Tour_date object
Tour_date.prototype.update_globals = function(){
    google_lat = this.lat;
    google_lon = this.lon;
};

//input: none
//output: A DOM element with class item and class tour_date for the carousel
Tour_date.prototype.make_dom_object = function(first, id){
    var tour_date_dom = $('<div>').addClass('item').addClass('tour_div');
    tour_date_dom.addClass('tour_date');
    if (first){
        tour_date_dom.addClass('active');
    }
    tour_date_dom.attr('data-id', ''+id);
    var city_div = $('<div>').html('City: ' + this.venue_city);
    var date = $('<div>');
    var venue_div = $('<div>').html('Venue: ' + this.venue_name);
    date.html('Date: ' + this.event_date);
    // tour_date_dom.html(this.venue_city);
    tour_date_dom.append(venue_div, city_div, date);

    $('#myCarousel .carousel-inner').append(tour_date_dom);
    console.log('appending dom to carousel');
};

//input: none
//output: an empty carousel in the main page
function clear_carousel(){
    $('#myCarousel.carousel.slide .carousel-indicators').children().remove();
    $('#myCarousel .carousel-inner').children().remove();
    console.log('clear carousel?');
}

//input: List of date objects
//output: Carousel is populated with tour_date divs generated from bandsintown API
function populate_carousel(event_list){
    clear_carousel();
    console.log(event_list);
    var first = true;
    for (var i = 0; i < event_list.length; i++){
        var new_indicator = $('<li>').attr('data-target', '#myCarousel');
        new Tour_date(event_list[i], first, i);
        if (first == true){
            first = false;
        }
        new_indicator.attr('data-slide-to', ''+i);
        $('#myCarousel .carousel-indicators').append(new_indicator);
    }
}


//input: none, triggered when clicking the venue information button
//output: Loads information about the currently displayed venue for gmaps and street view
function load_google(){
    var current_venue = global_tour_dates[$('.item.active').attr('data-id')];
    google_lat = current_venue.lat_lon.lat;
    google_lon = current_venue.lat_lon.lon;
    venue_name = current_venue.name;
    $('#myModal .modal-dialog .modal-content .modal-header .modal-title').html(venue_name);
    initialize();
}

//input: none
//output: google modal populated with content based off of the current venue
function initialize() {
    var att = {lat: Number(google_lat), lng: Number(google_lon) };
    var map = new google.maps.Map(document.getElementById('map2'), {
        center: att,
        zoom: 15
    });
    var panorama = new google.maps.StreetViewPanorama(
        document.getElementById('pano2'), {
            position: att,
            pov: {
                heading: 34,
                pitch: 10
            }
        });
    map.setStreetView(panorama);
}

//input: artist_name, string containing the name of the artist that we are going to load content for
//output: the global array global_tour_dates is full of events based off of the artist that was searched for

function populate_tour(artist_name){
    var no_artist = false;
    global_tour_dates = [];
    $.getJSON("http://api.bandsintown.com/artists/" + artist_name + "/events.json?callback=?&app_id=LF_HACKATHON&date=2010-01-01,2016-01-01", function(result) {
            $.each(result, function(key, value){
                if(key == 'errors'){
                    no_artist_carousel();
                    no_artist=true;
                    return;
                }
                if(result[key].venue.region == 'CA'){//only target events taking place in california
                    var temp_venue_info = result[key];
                    var temp_venue = {};
                    temp_venue.event_date = temp_venue_info.datetime;
                    temp_venue.name = temp_venue_info.venue.name;
                    temp_venue.city = temp_venue_info.venue.city;
                    temp_venue.lat_lon = {lat: temp_venue_info.venue.latitude, lon:temp_venue_info.venue.longitude};
                    console.log ('key: ' + key + ', info:', temp_venue);
                    global_tour_dates.push(temp_venue);
                }
            });
        if(no_artist){return;}
            populate_carousel(global_tour_dates);
        });
        console.log("Tour populated");
}
function no_artist_carousel(){
    clear_carousel();
    console.log('no events found');
    var no_artist_div = $('<div>').addClass('item');
    no_artist_div.addClass('tour_div');
    no_artist_div.addClass('active');
    no_artist_div.html('Who? <br> (No artist found.)');
    no_artist_div.css('text-align', 'center');
    $('.carousel-inner').append(no_artist_div);
}

// Load the IFrame Player API code asynchronously.
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/player_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// Replace the 'ytplayer' element with an <iframe> and
// YouTube player after the API code downloads.
var player;
function onYouTubePlayerAPIReady() {
    player = new YT.Player('ytplayer', {
        height: '390',
        width: '640',
        videoId: vid_id
    });
 
}


//Function video_search
//input: YT_search string
//output: Loads youtube videos using the search string. Initializes the YT player and
function video_search(YT_search) {
    apis.youtube.getData(YT_search, 5, function (success, response) {
        if (success) {
            console.log(response);
            vid_id = response.video[vid_index].id;
            populate_youtube_array(response);
            onYouTubePlayerAPIReady();
        }
    });
}
//function speaker
//input: none
//output: creates the speaker grills beside the youtube video
function speaker () {
    var speaker_position = $('.speaker_hole').position().top;
    var speaker_div = $('<div>').addClass('speaker_hole speaker_animate');
    $('.speaker').append(speaker_div.css('top',speaker_position));
    var second_speaker_position;
    var large_speaker;
    var backward = $('<span>').addClass('glyphicon glyphicon-step-backward speaker_glyph prev_vid');
    var forward = $('<span>').addClass('glyphicon glyphicon-step-forward speaker_glyph next_vid');

    $('.speaker_animate').animate({top: speaker_position + 150 + 'px'},1000, function () {
        $('#speaker_left .speaker_animate').append(backward);
        $('#speaker_right .speaker_animate').append(forward);
    });
    setTimeout(function () {
        second_speaker_position = $('.speaker_animate').position().top;
        large_speaker = $('<div>').addClass('speaker_hole speaker_grow ');
        $('.speaker').append(large_speaker.css('top', second_speaker_position));
        $('.speaker_grow').animate({top: '-=25', height: '+=50', width: '+=50'},500);
    },1000);
    $( '#speaker_right').on('click','.next_vid', function(){
        next_video();
    });
    $('#speaker_left').on('click','.prev_vid', function(){
        prev_video();
    });
}

var ra = 0;
var rd = 0;
var et = 0;

//input: none, triggered when the user hovers over the RRE logo in the top left
//output: Expands the logo to display the full name of the team.
function ramrod () {
    var ram = 'am';
    var rod = 'od';
    var entertainment = 'ntertainment';
    if (rd < rod.length) {
        var stringLetterTwo = rod.charAt(rd++);
        $(".text_two").text($(".text_two").text() + stringLetterTwo);
    }
    if (ra < ram.length) {
        var stringLetter = ram.charAt(ra++);
        $(".text_one").text($(".text_one").text() + stringLetter);
    }
    if (et < entertainment.length) {
        var stringLetterThree = entertainment.charAt(et++);
        $(".text_three").text($(".text_three").text() + stringLetterThree);
    }
    else {
        return false;
    }
    setTimeout(ramrod, 75);
}

//function ramrod_leave
//input: none, triggers when the user moves the cursor off the navbar
//output: shrinks the team name back down to RRE
function ramrod_leave () {
    $('.text_one,.text_two,.text_three').html('');
    ra = 0;
    rd = 0;
    et = 0;
}

//input: response: Object with info from the youtube API call
//output: global array youtube_array is populated with info from the YT api call
function populate_youtube_array(response){
    var tube = response.video;
    for (var x = 0; x < tube.length; x++){
        var youtube_obj = {};
        youtube_obj.id = tube[x].id;
        youtube_obj.title = tube[x].title;
        youtube_array.push(youtube_obj);
    }
    console.log("My Youtube array", youtube_array);
    return youtube_array;
}

//input: none
//output: the main_content page slides down and becomes hidden. All content is cleared.
function home_slide () {
    var mainHeight = $('#main_page').height();
    $('#main_page').animate({top:mainHeight + 'px'},1500);
    $('.twitter_card').remove();
    $('.speaker_animate').remove();
    $('.speaker_grow').remove();
    $('.drop_animate').remove();
    $('iframe').remove();
    drop = true;
    var new_youtube = $('<div>').attr('id','ytplayer');
    $('.youtube').append(new_youtube);
}

//function twitter_feed_update
//input: twitter_search string
//output: calls process_twitter_api() to fill the twitter feed on the right side and calls speaker().
function twitter_feed_update (twitter_search) {
    apis.twitter.getData(twitter_search,
        function (success, response) {
            var my_tweets = response.tweets.statuses;
            for (var i = 0; i < response.tweets.statuses.length; i++) {
            }
            var temp_array = process_twitter_api(response);
        });
    speaker ();
}

//function next_video
//input: none
//output: Moves to the next video in the array of videos pulled from the YT api, if possible.
function next_video (){
    if(vid_index === youtube_array.length-1){
        return;
    }
    else{
        vid_index++;
        vid_id = youtube_array[vid_index].id;
        console.log(vid_id);
        $('iframe').remove();
        var new_youtube = $('<div>').attr('id','ytplayer');
        $('.youtube').append(new_youtube);
        onYouTubePlayerAPIReady()
    } 
}

//function prev_video
//input: none
//output: Moves to the previous video in the array of videos pulled from the YT api, if possible.
function prev_video (){
    if(vid_index === 0) {
        return;
    }
    else{
        vid_index--;
        vid_id = youtube_array[vid_index].id;
        $('iframe').remove();
        var new_youtube = $('<div>').attr('id','ytplayer');
        $('.youtube').append(new_youtube);
        onYouTubePlayerAPIReady()
    }
}

//function nickleback()
//input: None, triggered when clicking the artist info button
//output: Despair (nickleback video plays in modal)
function nickleback() {
    var loading_spinner = $('<div>').addClass('loader');
    $('#vine-player').append(loading_spinner);
    apis.vine.getData('look at this graph', function (success, response) {
        if (success) {
            $('.loader').remove();
            var vid_id = response.vines[0].html;
            $('#vine-player').append(vid_id);
        }
    });
}
//function remove_the_back()
//input: none, triggered when closing the nickleback function
//output: Life (nickleback is removed)
function remove_the_back () {
    $('#vine-player').html('');
}


//input: none, triggered when clicking the tour info button
//output: a grumpy cat
function rick_roll () {
    apis.flickr.getData("grumpy cat", 5, function (success,response) {
        if (success) {
           var rand_ind = Math.floor(Math.random()* 5);
           var pic_id = response.urls[rand_ind];
           var pic_to_append = $('<img>').attr('src',pic_id);
           $('#rick_roll').append(pic_to_append);
           console.log(pic_id);
       }
    })
}

//input: none
//output: grumpy cat is gone;
function remove_the_grump () {
    $('#rick_roll').html('');
}

var templateSource = document.getElementById('results-template').innerHTML,
    template = Handlebars.compile(templateSource),
    resultsPlaceholder = document.getElementById('results'),
    playingCssClass = 'playing',
    audioObject = null;

var fetchTracks = function (albumId, callback) {
    $.ajax({
        url: 'https://api.spotify.com/v1/albums/' + albumId,
        success: function (response) {
            callback(response);
        }
    });
};

var searchAlbums = function (query) {
    $.ajax({
        url: 'https://api.spotify.com/v1/search',
        data: {
            q: query,
            type: 'album'
        },
        success: function (response) {
            resultsPlaceholder.innerHTML = template(response);
        }
    });
};

results.addEventListener('click', function (e) {
    var target = e.target;
    if (target !== null && target.classList.contains('cover')) {
        if (target.classList.contains(playingCssClass)) {
            audioObject.pause();
        } else {
            if (audioObject) {
                audioObject.pause();
            }
            fetchTracks(target.getAttribute('data-album-id'), function (data) {
                audioObject = new Audio(data.tracks.items[0].preview_url);
                audioObject.play();
                target.classList.add(playingCssClass);
                audioObject.addEventListener('ended', function () {
                    target.classList.remove(playingCssClass);
                });
                audioObject.addEventListener('pause', function () {
                    target.classList.remove(playingCssClass);
                });
            });
        }
    }
});

document.getElementById('search-form').addEventListener('submit', function (e) {
    e.preventDefault();
    searchAlbums(document.getElementById('query').value);
}, false);