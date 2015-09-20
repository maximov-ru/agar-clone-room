$(document).ready(function(){
    var last_request = null;
    $('#pass_fld').hide();
    window.pl = $("label[for='pass_fld']").hide();
    $('#nickname').on('keyup',function(){
        $.ajax({
            method:'post',
            url:'/auth',
            data:{username:$('#nickname').val()},
            dataType:'json',
            beforeSend: function(j){
                if(last_request){
                    last_request.abort();
                }
                last_request = j;
            },
            success: function(jData){
                if(jData.ret){
                    $('#pass_fld').show();
                }else{
                    $('#pass_fld').hide();
                }
            },
            done: function(){
                last_request = null;
            }
        });
    });
});