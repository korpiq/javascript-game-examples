function PageEditor() {

    var pageEditDialog = createPageEditDialog()
    var selectedElement = document.body
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
        console.log('showing page editing dialog', event)
        pageEditDialog.style.top = event.clientY + 'px'
        pageEditDialog.style.left = event.clientX + 'px'
        document.body.appendChild(pageEditDialog)
        beforeContextMenu.onkeydown = window.onkeydown
        beforeContextMenu.onmousedown = window.onmousedown
        window.onkeydown = hidePageEditDialogByEvent
        window.onmousedown = hidePageEditDialogByEvent

        contextMenuAt.x = event.clientX
        contextMenuAt.y = event.clientY
        selectedElement = document.body.contains(event.target) ? event.target : document.body
        const showAreaOptions = selectedElement !== document.body
        const areaOptionsDialog = document.getElementById('page-editor-dialog-options-for-area')
        areaOptionsDialog.style.display = showAreaOptions ? 'inherit' : 'none'

        return false
    }

    function hidePageEditDialog() {
        console.log('hiding page editing dialog', event)
        if (document.body.contains(pageEditDialog)) {
            document.body.removeChild(pageEditDialog)
            window.onmousedown = beforeContextMenu.onmousedown
            window.onkeydown = beforeContextMenu.onkeydown
        }
    }

    function hidePageEditDialogByEvent(event) {
        if (event.key || !isMouseOnEditDialog) {
            console.log('hiding page editing dialog', event)
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
            deepMergeObjects(attributes, element)
        }
        if (children) {
            element.append(...children)
        }
        return element
    }

    function deepMergeObjects(source, target) {
        for (key in source) {
            const value = source[key]
            if (typeof (value) === 'object') {
                deepMergeObjects(value, target[key])
            } else {
                target[key] = value
            }
        }
    }

    function createButton(innerText, onclick) {
        return createElement('div', {}, [createElement('button', { innerText, onclick })])
    }

    function addDiv(parent, x, y) {
        var offsetParent = parent
        while (offsetParent) {
            x -= offsetParent.offsetLeft
            y -= offsetParent.offsetTop
            offsetParent = offsetParent.offsetParent
        }
        x = Math.floor(x / gridSize.x) * gridSize.x
        y = Math.floor(y / gridSize.y) * gridSize.y

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
        selectedElement = div
    }

    return { editPage, savePage }
}
