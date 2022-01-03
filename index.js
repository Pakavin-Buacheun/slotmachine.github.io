var toastElList = [].slice.call(document.querySelectorAll('.toast'))
var toastList = toastElList.map(function(toastEl) {
    return new bootstrap.Toast(toastEl)
})

var offcanvasElementList = [].slice.call(document.querySelectorAll('.offcanvas'))
var offcanvasList = offcanvasElementList.map(function(offcanvasEl) {
    return new bootstrap.Offcanvas(offcanvasEl)
})

var mute = false

function stopSound() {
    spinning.removeCue(spinningCue)
    spinning.stop()

    stopSpinning.removeCue(stopSpinningCue)
    stopSpinning.stop()

    winning.removeCue(winningCue)
    winning.stop()
}

function muteBtn() {
    var checkBox = document.getElementById("mute");
    if (checkBox.checked == true) {
        mute = true
        stopSound()
    } else mute = false
}