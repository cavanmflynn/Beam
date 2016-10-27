// Firebase Config
// Replace with your project's customized code snippet
var config = {
  apiKey: "<API_KEY>",
  authDomain: "<PROJECT_ID>.firebaseapp.com",
  databaseURL: "https://<DATABASE_NAME>.firebaseio.com",
  storageBucket: "<BUCKET>.appspot.com",
  messagingSenderId: "<SENDER_ID>",
};

// Initialize Firebase
firebase.initializeApp(config);
var db = firebase.database();
var auth = firebase.auth();
var firepad = null;
var downloadURL = null;
var codeMirror = null;
var mode = 'text';
var theme = 'default';

// Error Message Tokens
this.firebaseToken = document.querySelector("#firebase-token");
this.resetEmailToken = document.querySelector("#reset-email-token");

// Toggle Code Mode
$(".code-button").click(function() {
    if (mode === 'text') {
        codeMirror.setOption("mode", "javascript");
        codeMirror.setOption("lineNumbers", true);
        mode = 'code';
        $(this).removeClass("red");
        $(this).addClass("green");
        $(".language-dropdown-button").html("JS");
        $(".beautify-button").css("right", "110px");
        $(".language-dropdown-button").show();
        $(".beautify-button").show();
    } else {
        codeMirror.setOption("mode", "");
        codeMirror.setOption("lineNumbers", false);
        mode = 'text';
        $(this).removeClass("green");
        $(this).addClass("red");
        $(".language-dropdown-button").hide();
        $(".beautify-button").hide();
    }
});

// Change Language
$(".language-selection").click(function() {
    var newLanguageMode = this.id;
    var newLanguageName = $(this).text();

    if (newLanguageName === "HTML") {
        $(".beautify-button").css("right", "136px");
    }

    if (newLanguageName === "CSS") {
        $(".beautify-button").css("right", "122px");
    }

    if ((newLanguageName === "JS") ||
        (newLanguageName === "HTML") ||
        (newLanguageName === "CSS")) {
        $(".beautify-button").show();
    } else {
        $(".beautify-button").hide();
    }

    codeMirror.setOption("mode", newLanguageMode);
    $(".language-dropdown-button").html(newLanguageName);
});

// Toggle Nightmode
$(".night-mode-button").click(function() {
    if (theme === 'default') {
        codeMirror.setOption("theme", "seti");
        theme = 'seti';
        $(this).removeClass("yellow accent-4");
        $(this).addClass("grey darken-4");
        $(this).children("i").html("brightness_3");
    } else {
        codeMirror.setOption("theme", "default");
        theme = 'default';
        $(this).removeClass("grey darken-4");
        $(this).addClass("yellow accent-4");
        $(this).children("i").html("wb_sunny");
    }
});

// Gets the range of selected code
function getSelectedRange() {
    return {
        from: codeMirror.getCursor(true),
        to: codeMirror.getCursor(false)
    };
}

// Beautifies Selected Code
function autoFormatSelection() {
    var range = getSelectedRange();
    codeMirror.autoFormatRange(range.from, range.to);
}

// User Registration
function authRegister(event) {
    event.preventDefault();
    var registerForm = $("form[name='registerForm']");
    var reg_email = registerForm.find('#register_email').val();
    var reg_password = registerForm.find('#register_password').val();

    // Show Loader
    $(".longfazers").show();

    // User Registration
    firebase
        .auth()
        .createUserWithEmailAndPassword(reg_email, reg_password)
        .then(function() {})
        .catch(function(err) {
            $(".longfazers").hide();
            this.firebaseToken.innerHTML = err.message;
        })
}

// User Login
function authLogin(event) {
    event.preventDefault();
    var loginForm = $("form[name='loginForm']");
    var log_email = loginForm.find('#login_email').val();
    var log_password = loginForm.find('#login_password').val();

    // Show Loader
    $(".longfazers").show();

    // User Login
    firebase
        .auth()
        .signInWithEmailAndPassword(log_email, log_password)
        .then(function() {
            window.location.replace("index.html");
        })
        .catch(function(err) {
            $(".longfazers").hide();
            this.firebaseToken.innerHTML = err.message;
        });
}

// User Logout
function logout() {
    firebase.auth().signOut().then(function() {
    }, function(error) {
        alert('Something went wrong! You could not be logged out :/');
    });
}

// Send Reset Email
function resetPassword(event) {
    event.preventDefault();
    var resetPasswordForm = $("form[name='resetPasswordForm']");
    var reset_email = resetPasswordForm.find('#reset_email').val();

    firebase.
    auth().sendPasswordResetEmail(reset_email).then(function() {
        this.resetEmailToken.style.color = "#00c853";
        this.resetEmailToken.innerHTML = "Email Sent!";
    }, function(error) {
        this.resetEmailToken.style.color = "#f44336";
        this.resetEmailToken.innerHTML = error.message;
    });
}

// Clear error messages when navigating
function authNav() {
    this.firebaseToken.innerHTML = "";
}


// Clear reset email token and input field when closing modal
function closeResetPasswordModal() {
    this.resetEmailToken.innerHTML = "";
    $('#reset_email').val('');
}


// Set the current user
firebase.auth().onAuthStateChanged(function(user) {
    if (user) {

        //// Create CodeMirror (with lineWrapping on).
        codeMirror = CodeMirror(document.getElementById('firepad-container'), {
            lineWrapping: true,
            mode: ''
        });
        //// Create Firepad (with rich text toolbar and shortcuts enabled).
        firepad = Firepad.fromCodeMirror(db.ref().child(user.uid), codeMirror, {
            richTextToolbar: true,
            richTextShortcuts: true
        });

        //// Initialize contents.
        firepad.on('ready', function() {
            if (firepad.isHistoryEmpty()) {
                firepad.setHtml(
                    'Welcome to Beam! <br/>Anything you type here will be available wherever you login next!');
            }
        });

        // Register the download link on receiving computers.
        firepad.registerEntity('link', {
            render: function(info, entityHandler) {
                var inputElement = document.createElement('a');
                inputElement.innerHTML = info.innerHTML;
                inputElement.setAttribute('target', '_blank');
                inputElement.setAttribute("class", "btn green accent-4");
                inputElement.style.textTransform = 'capitalize';
                inputElement.href = info.href;

                return inputElement;
            }.bind(this),
            fromElement: function(element) {
                var info = {};
                info.innerHTML = element.innerHTML;
                info.href = element.href;

                return info;
            },
            update: function(info, element) {
                element.innerHTML = info.innerHTML;
                element.setAttribute('target', '_blank');
                element.setAttribute("class", "btn green accent-4");
                element.style.textTransform = 'capitalize';
                element.href = info.href;
            },
            export: function(info) {
                var inputElement = document.createElement('a');
                inputElement.innerHTML = info.innerHTML;
                inputElement.setAttribute('target', '_blank');
                inputElement.setAttribute("class", "btn green accent-4");
                inputElement.style.textTransform = 'capitalize';
                inputElement.href = info.href;

                return inputElement;
            }
        });
    } else {
      var pathname = window.location.pathname;
      if (!pathname.includes('authentication.html')) {
          window.location.replace("authentication.html");
      }
    }
});

// File Upload
function uploadFile() {
    // File or Blob
    var file = document.querySelector('input[type=file]').files[0];
    var filename = document.querySelector('input[type=file]').files[0].name;
    var filetype = document.querySelector('input[type=file]').files[0].type;

    // Create a root reference
    var storageRef = firebase.storage().ref();

    // Unique File Path
    var uid = firebase.auth().currentUser.uid;

    // Create the file metadata
    var metadata = {
        contentType: filetype
    };

    // Upload file and metadata to the object 'files/...'
    var uploadTask = storageRef.child(uid + '/' + filename).put(file, metadata);

    // Listen for state changes, errors, and completion of the upload.
    uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, // or 'state_changed'
        function(snapshot) {
            // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
            var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;

            $(".file-loader").width(progress + '%');

            switch (snapshot.state) {
                case firebase.storage.TaskState.PAUSED:
                    console.log('Upload is paused');
                    break;
                case firebase.storage.TaskState.RUNNING:
                    console.log('Upload is running');
                    break;
            }
        },
        function(error) {
            switch (error.code) {
                case 'storage/unauthorized':
                    alert("You do not have permission to access this object.");
                    break;

                case 'storage/canceled':
                    alert("Upload was canceled.");
                    break;

                case 'storage/unknown':
                    alert("An unknown error occurred.");
                    break;
            }
        },
        function() {
            // Upload completed successfully, get the download URL
            downloadURL = uploadTask.snapshot.downloadURL;
            var currentText = firepad.getHtml();
            var updatedText = '<br/><br/><link></link>';
            firepad.setHtml(currentText + updatedText);
        });

    // Register the download link.
    firepad.registerEntity('link', {
        render: function(info, entityHandler) {
            var inputElement = document.createElement('a');
            inputElement.innerHTML = 'Download ' + filename;
            inputElement.setAttribute('target', '_blank');
            inputElement.setAttribute("class", "btn green accent-4");
            inputElement.style.textTransform = 'capitalize';
            inputElement.href = downloadURL;

            return inputElement;
        }.bind(this),
        fromElement: function(element) {
            var info = {};
            info.innerHTML = 'Download ' + filename;
            info.href = downloadURL;

            return info;
        },
        update: function(info, element) {
            element.innerHTML = info.innerHTML;
            element.setAttribute('target', '_blank');
            element.setAttribute("class", "btn green accent-4");
            element.style.textTransform = 'capitalize';
            element.href = info.href;
        },
        export: function(info) {
            var inputElement = document.createElement('a');
            inputElement.innerHTML = info.innerHTML;
            inputElement.setAttribute('target', '_blank');
            inputElement.setAttribute("class", "btn green accent-4");
            inputElement.style.textTransform = 'capitalize';
            inputElement.href = info.href;

            return inputElement;
        }
    });
}
