$(document).ready(function(){
//validation for file size
$.fn.validator.Constructor.VALIDATORS.filesize = function ($el) {
    var fileSizeMax = $el.data('filesize');
    if ($el[0].files[0] && $el[0].files[0].size>fileSizeMax) {
        return false;
    } else {
        return true;
    }
};
//validate upload FormData
$('#myForm').validator();

$('#mycarousel').carousel({
	interval:6000
});//mycarousel
$('#sponsors').carousel({
	interval:5000
});//sponsors
$('#corganizers').carousel({
	interval:5000
});//co-orgnaizers
$('.selector').on('change', function() {
	$.ajax({
		type:"POST",
		url: 'selectionchange',
		data: {"userchange": $(this).val(), "id": $(this).attr('id')},
		success:function(){
			//alert('success');
		}
	});
});
//role selection
$( ".roleselector" ).change(function(e){
  var value =  $(this).val();
  var id = e.target.id;
  $.ajax({
    method: "POST",
    url: "rolechange",
    data: { role: value, id: id }
  });
});
//select track for coordinator
$(".trackselector").change(function(e){
  var value =$(this).val();
  var id = e.target.id;
  $.ajax({
    method: "POST",
    url: "trackchange",
    data: {coordinator: value, track: id}
  });
});
//assign paper for writer
$('.assignpaper').change(function(e){

});

$('#loginsubmit').click(function(e){
  e.preventDefault();
  var email = $('#email').val();
  var password = $('#password').val();

  $.ajax({
    method: "POST",
    url: 'loginpost',
    async: false,
    data:{"email":email, "password":password},
    success: function(data){
      window.location.href = "/";
      //alert('success');
      return true;
    }, error: function (request, status, error) {
        // alert("your email or password is incorrect");
        $('.password').html('<ul class="list-unstyled" style="color:red;"><li>your email or password is invalid.</li></ul>')
        return false;
    }
  });
});
//registration submit
$('#registersubmit').validator().click(function(e){
  e.preventDefault();
  var option = $('#option').val();
  var email = $('#email').val();
  var firstname = $('#firstname').val();
  var middlename = $('#middlename').val();
  var lastname = $('#lastname').val();
  var title = $('#title').val();
  var phone = $('#phone').val();
  var organization = $('#organization').val();
  var position = $('#position').val();
  var country = $('#country').val();
  var address = $('#address').val();
  var password = $('#pass').val();

  $.ajax({
    method: "POST",
    url: 'register',
    async: false,
    data:{"option": option, "email":email, "firstname":firstname, "middlename":middlename,
    "lastname":lastname, "title":title, "phone":phone, "organization": organization,
    "position": position, "country":country, "address":address, "password":password},
    success: function(data){
      window.location.href = "/";
      //alert('success');
      return true;
    }, error: function (request, status, error) {
        // alert("your email or password is incorrect");
        //$('.email').html('<ul class="list-unstyled" style="color:red;"><li>this email addrss exists.</li></ul>');
        $('#pass').val('');
        $('#confpass').val('');
        return false;
    }
  });
});

// $('.uploadeddoc').click(function(e){
//   var uploadeddoc = e.target.id;
//   $.ajax({
//     method: "POST",
//     url: "downloaddoc",
//     data:{"uploadeddoc": uploadeddoc},
//     responseType: 'arraybuffer',
//     success: function(){
//       //window.open('/download?'+ uploadeddoc);
//     }
//   });
// });

//on submission of paper
/*
$('#submitPaper').on('click', function(){
	var data = new FormData();
	data.append('file', $('#submitFile')[0].files[0]);
	data.append('track', $('#submitTrack').val());
	data.append('submissiontype', $('#submissionType').val());
	data.append('title', $('#submitTitle').val());
	data.append('abstract', $('#submitAbstract').val());
	data.append('keyword', $('#submitKeyword').val());

	$.ajax({
		url:'upload',
		type:'post',
		contentType: false,
		processData: false,
		data:data
	}).done(function(){
		alert('alert');
	});
});
*/
});
