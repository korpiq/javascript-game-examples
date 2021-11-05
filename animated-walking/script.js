var game = {
    protagonist: {
        image: null,
        directions: {
            down: {
                image_set: 1,
                move: { y: 6 },
                frames: [1, 0, 1, 2, 3, 4, 2],
            },
            up: {
                image_set: 0,
                move: { y: -6 },
                frames: [1, 0, 1, 2, 3, 4, 2],
            },
            left: {
                image_set: 3,
                move: { x: -6 },
                frames: [1, 2, 3, 4, 5, 6, 7, 0],
            },
            right: {
                image_set: 2,
                move: { x: 6 },
                frames: [1, 2, 3, 4, 5, 6, 7, 0],
            },
        },
        direction: 'down',
        frame: 0,
        keep_walking: false,
        walk_frame_delay: 100,
        walking_timeout_id: null,
    }
}

function start_game() {
    game.protagonist.image = document.getElementById('protagonist')
    document.body.onkeydown = key_pushed
}

function key_pushed(event) {
    switch (event.key) {
        case 'w': walk('up'); break;
        case 's': walk('down'); break;
        case 'a': walk('left'); break;
        case 'd': walk('right'); break;
    }
}

function walk(direction) {
    if (game.protagonist.walking_timeout_id != null && game.protagonist.direction === direction) {
        game.protagonist.keep_walking = true
    } else {
        if (game.protagonist.walking_timeout_id != null) {
            clearTimeout(game.protagonist.walking_timeout_id)
        }
        game.protagonist.direction = direction
        game.protagonist.frame = 0
        walk_frame(game.protagonist, game.protagonist.directions[direction])
    }
}

function walk_frame(protagonist, direction) {

    if (protagonist.frame >= direction.frames.length) {
        if (protagonist.keep_walking) {
            // all frames shown but key for same direction hit, so continue
            protagonist.keep_walking = false
            protagonist.frame = 0
        } else {
            // all frames shown and key not down anymore, so stop here.
            protagonist.walking_timeout_id = null
            return
        }
    }

    var frame_image_number = direction.frames[protagonist.frame]
    protagonist.image.src = 'images/child-' + direction.image_set + '-' + frame_image_number + '.png'

    if (direction.move.x) {
        var x = protagonist.image.offsetLeft + direction.move.x
        protagonist.image.style.left = x + 'px'
    }
    if (direction.move.y) {
        var y = protagonist.image.offsetTop + direction.move.y
        protagonist.image.style.top = y + 'px'
    }

    // show next frame after a delay
    ++protagonist.frame
    protagonist.walking_timeout_id = setTimeout(() => walk_frame(protagonist, direction), protagonist.walk_frame_delay)
}
