function PageEditor() {

    var pageEditDialog = createPageEditDialog()
    var selectedElement = document.body
    var dragger = undefined
    var gridSize = {
        x: 16,
        y: 16,
    }
    var isMouseOnEditDialog = false
    var contextMenuAt = {
        x: 0,
        y: 0,
    }
    var beforeContextMenu = {
        onkeydown: window.onkeydown,
        onmousedown: window.onmousedown
    }

    function editPage() {
        window.oncontextmenu = showPageEditDialog
        console.log('Page editor activated')
    }

    function savePage(filename) {
        console.log('saving page')
        const content = [
            '<!DOCTYPE html>\n<html>\n',
            document.head.outerHTML.replace(/\s*\n+/gs, '\n'), '\n',
            document.body.outerHTML.replace(/\s*\n+/gs, '\n'), '\n',
            '</html>\n',
        ]
        const contentBlob = new Blob(content, { type: 'text/plain' })
        const downloadLink = document.createElement('a')
        const pageUrl = new URL(window.location.toString())
        const filepath = (filename || '').toString() || pageUrl.searchParams['edit'] || pageUrl.pathname || 'index.html'
        downloadLink.download = filepath.replace(/.*\//, '')
        downloadLink.href = window.webkitURL.createObjectURL(contentBlob)
        downloadLink.click()

        return false
    }

    function showPageEditDialog(event) {
        pageEditDialog.style.top = event.clientY + 'px'
        pageEditDialog.style.left = event.clientX + 'px'
        document.body.appendChild(pageEditDialog)
        beforeContextMenu.onkeydown = window.onkeydown
        beforeContextMenu.onmousedown = window.onmousedown
        window.onkeydown = hidePageEditDialogByEvent
        window.onmousedown = hidePageEditDialogByEvent

        contextMenuAt.x = event.clientX
        contextMenuAt.y = event.clientY
        selectElement(event.target)
        const showAreaOptions = selectedElement !== document.body
        const areaOptionsDialog = document.getElementById('page-editor-dialog-options-for-area')
        areaOptionsDialog.style.display = showAreaOptions ? 'inherit' : 'none'

        return false
    }

    function hidePageEditDialog() {
        if (document.body.contains(pageEditDialog)) {
            document.body.removeChild(pageEditDialog)
            window.onmousedown = beforeContextMenu.onmousedown
            window.onkeydown = beforeContextMenu.onkeydown
        }
    }

    function hidePageEditDialogByEvent(event) {
        if (event.key || !isMouseOnEditDialog) {
            if (document.body.contains(pageEditDialog)) {
                document.body.removeChild(pageEditDialog)
                window.onmousedown = beforeContextMenu.onmousedown
                window.onkeydown = beforeContextMenu.onkeydown
            }
            if (event.key === 'Escape') {
                return false // key was pressed only for closing dialog
            }
        }
    }

    function createPageEditDialog() {
        function afterHidingDialog(f, args) {
            return () => {
                hidePageEditDialog()
                f(...(args || []))
            }
        }
        return createElement(
            'div',
            {
                id: 'page-editor-dialog',
                onmouseover: () => isMouseOnEditDialog = true,
                onmouseout: () => isMouseOnEditDialog = false,
            },
            [
                createElement('div', { id: 'page-editor-dialog-options-for-area', style: { display: 'none' } }, [
                    createButton('Delete area', afterHidingDialog(() => selectedElement.remove())),
                    createElement('hr')
                ]),
                createButton('Add area', afterHidingDialog(() => addDiv(selectedElement, contextMenuAt.x, contextMenuAt.y))),
                createButton('Save page', afterHidingDialog(savePage)),
            ],
        )
    }

    function createElement(tagName, attributes, children) {
        const element = document.createElement(tagName)
        if (attributes) {
            deepMergeToObject(attributes, element)
        }
        if (children) {
            element.append(...children)
        }
        return element
    }

    function deepMergeToObject(source, target) {
        for (key in source) {
            const value = source[key]
            if (value instanceof Object && !(Array.isArray(value) || (value instanceof Function))) {
                deepMergeToObject(value, target[key])
            } else {
                target[key] = value
            }
        }
    }

    function createButton(innerText, onclick) {
        return createElement('div', {}, [createElement('button', { innerText, onclick })])
    }

    function relateCoordinatesToElement(coordinates, element) {
        while (element) {
            coordinates = {
                x: coordinates.x - element.offsetLeft,
                y: coordinates.y - element.offsetTop
            }
            element = element.offsetParent
        }
        return coordinates
    }

    function addDiv(parent, x, y) {
        const coordinates = relateCoordinatesToElement({ x, y }, parent)
        x = Math.floor(coordinates.x / gridSize.x) * gridSize.x
        y = Math.floor(coordinates.y / gridSize.y) * gridSize.y

        if (x < 0 || x > (parent.offsetWidth || Infinity) || y < 0 || y > (parent.offsetHeight || Infinity)) {
            console.log('Outside parent area!')
            return
        }

        const div = createElement('div', { className: 'area' })
        div.style.left = x + 'px'
        div.style.top = y + 'px'
        div.style.minWidth = gridSize.x + 'px'
        div.style.minHeight = gridSize.y + 'px'

        parent.appendChild(div)
        selectElement(div)
    }

    function selectElement(it) {
        if (dragger) {
            dragger.end()
        }
        if (document.body.contains(it)) {
            selectedElement = it
            dragger = Draggable(it)
        } else {
            selectedElement = document.body
            dragger = undefined
        }
    }

    function Draggable(it) {
        const original = {
            onmousedown: it.onmousedown,
        }
        const originalWindow = {
            onmousemove: window.onmousemove,
            onmouseup: window.onmouseup,
        }
        var mouseFrom = { x: 0, y: 0 }
        var boxFrom = { x: 0, y: 0 }

        function move(event) {
            const dx = event.clientX - mouseFrom.x
            const dy = event.clientY - mouseFrom.y

            it.style.left = (boxFrom.x + dx) + 'px'
            it.style.top = (boxFrom.y + dy) + 'px'

            event.stopPropagation()
            return false
        }

        function resize(event) {
            const dx = event.clientX - mouseFrom.x
            const dy = event.clientY - mouseFrom.y

            it.style.width = (boxFrom.x + dx) + 'px'
            it.style.height = (boxFrom.y + dy) + 'px'

            event.stopPropagation()
            return false
        }

        function mouseDown(event) {
            mouseFrom = { x: event.clientX, y: event.clientY }
            const relativeMouse = relateCoordinatesToElement(mouseFrom, it.offsetParent)
            const distanceFromRightEdge = it.offsetLeft + it.offsetWidth - relativeMouse.x
            const distanceFromBottomEdge = it.offsetTop + it.offsetHeight - relativeMouse.y
            const closeToBottomRightCorner = distanceFromRightEdge < 6 && distanceFromBottomEdge < 6

            if (closeToBottomRightCorner) {
                boxFrom.x = it.offsetWidth
                boxFrom.y = it.offsetHeight
                window.onmousemove = resize
            } else {
                boxFrom.x = it.offsetLeft
                boxFrom.y = it.offsetTop
                window.onmousemove = move
            }

            window.onmouseup = mouseUp

            event.stopPropagation()
            return false
        }

        function mouseUp(event) {
            const action = window.onmousemove
            deepMergeToObject(originalWindow, window)

            const dx = event.clientX - mouseFrom.x
            const dy = event.clientY - mouseFrom.y
            if (action === move) {
                const x = Math.round((boxFrom.x + dx) / gridSize.x) * gridSize.x
                const y = Math.round((boxFrom.y + dy) / gridSize.y) * gridSize.y
                it.style.left = x + 'px'
                it.style.top = y + 'px'
            } else if (action === resize) {
                const x = Math.ceil((boxFrom.x + dx) / gridSize.x) * gridSize.x
                const y = Math.ceil((boxFrom.y + dy) / gridSize.y) * gridSize.y
                it.style.width = x + 'px'
                it.style.height = y + 'px'
            }

            event.stopPropagation()
            return false
        }

        function end() {
            deepMergeToObject(original, it)
            deepMergeToObject(originalWindow, window)
        }

        it.onmousedown = mouseDown

        return { end }
    }

    return { editPage, savePage }
}
