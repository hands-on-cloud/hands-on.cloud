// menu icon functionality
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
})