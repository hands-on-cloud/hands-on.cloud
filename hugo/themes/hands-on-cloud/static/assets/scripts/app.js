// menu icon functionality
function DeferLoadImages() {
	var imgDefer = document.getElementsByTagName('img');
	for (var i=0; i<imgDefer.length; i++) {
		if(imgDefer[i].getAttribute('data-lazy-src')) {
			imgDefer[i].setAttribute('src',imgDefer[i].getAttribute('data-lazy-src'));
		}
	}
}

jQuery(document).ready(function($){
	let pageOverlap = $(".page-overlap");
	let menuIcon = $('.header-nav-icon');
	let menuContent = $('#mob-Navigation');
	let siteBody = $('body');
	events();

	function events() {
	menuIcon.on('click', function() {
		toggleTheMenu();
	})

	}

	function toggleTheMenu() {
		menuContent.toggleClass("open");
		pageOverlap.toggleClass("open");
		menuIcon.toggleClass('open');
		siteBody.toggleClass('no-scroll');
	}

	DeferLoadImages();

	$("#TableOfContents").scrollspy({ offset: -85 });
})