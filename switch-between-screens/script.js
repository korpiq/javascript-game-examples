var game = {
    current_screen: null,
}

function start_game() {
    switch_to_screen('first_screen')
}

function hide(element) {
    if (element) {
        element.style.display = 'none'
    }
}

function show(element) {
    if (element) {
        element.style.display = 'block'
    }
}

function switch_to_screen(new_screen_id) {
    hide(game.current_screen)

    game.current_screen = document.getElementById(new_screen_id)

    show(game.current_screen)
}
