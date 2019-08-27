/* Contact
/*---------------------------------------------------- */
(function($) {
    "use strict";
    var testMobile,
        loadingError = '<p class="error">The Content cannot be loaded.</p>',
        nameError = 'Your name',
        emailError = 'Your email',
        invalidEmailError = 'Please enter a valid e-mail address',
        subjectError = '>Please enter the subject',
        messageError = 'Your message',
        mailSuccess = '<div class="alert alert-success fade in">Your message has been sent. Thank you!<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a></div>',
        mailResult = $('#contact-form-container .result');
    $("#mail_form").submit(function() {
        var form = $(this);
        var formParams = form.serialize();
        $.ajax({
            url: 'contact.php',
            type: 'POST',
            traditional: true,
            data: formParams,
            success: function(data) {
                console.log(data);
                var response = jQuery.parseJSON(data);
                $("#contact-form-container .alert").remove();
                if (response.success) {
                    $("#contact-form-container .alert").remove();
                    mailResult.append(mailSuccess);
                    $(document.getElementsByName("contact[name]")).val("");
                    $(document.getElementsByName("contact[email]")).val("");
                    $(document.getElementsByName("contact[message]")).val("");
                } else {
                    $('#contact-form-container .alert-info').remove();
                    $(document.getElementsByName("contact[name]")).removeClass("error");
                    $(document.getElementsByName("contact[email]")).removeClass("error");
                    $(document.getElementsByName("contact[message]")).removeClass("error");
                    for (var i = 0; i < response.errors.length; i++) {
                        if (response.errors[i].error == 'empty_name') {
                            $(document.getElementsByName("contact[name]")).addClass("error");
                            $(document.getElementsByName("contact[name]")).val(nameError);
                            error_("contact[name]");
                        }
                        if (response.errors[i].error == 'empty_email') {
                            $(document.getElementsByName("contact[email]")).addClass("error");
                            $(document.getElementsByName("contact[email]")).addClass("error");
                            $(document.getElementsByName("contact[email]")).val(emailError);
                            error_("contact[email]");
                        }
                        if (response.errors[i].error == 'empty_message') {
                            $(document.getElementsByName("contact[message]")).addClass("error");
                            $(document.getElementsByName("contact[message]")).val(messageError);
                            error_("contact[message]");
                        }
                        if (response.errors[i].error == 'invalid') {
                            $(document.getElementsByName("contact[email]")).addClass("error");
                            $(document.getElementsByName("contact[email]")).val(invalidEmailError);
                            error_("contact[email]");
                        }
                    }
                }
            }
        })
        return false;
    });

    function error_(el) {
        var i = 0;
        var refreshId = setInterval(function() {
            $(document.getElementsByName(el)).css('color', 'transparent');
            setTimeout(function() {
                $(document.getElementsByName(el)).css('color', '#900200');
            }, 300);
            i++;
            if (i > 2) {
                clearInterval(refreshId);
                $(document.getElementsByName(el)).val("");
            }
        }, 500);
    }
})(jQuery);