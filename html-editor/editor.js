function PageEditor() {

    var pageEditDialog = createPageEditDialog()
    var isMouseOnEditDialog = false
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
        return createElement(
            'div',
            {
                id: 'editor-dialog',
                onmouseover: () => isMouseOnEditDialog = true,
                onmouseout: () => isMouseOnEditDialog = false,
            },
            [
                createElement('div', null, ['Page editor']),
                createButton('Add div', (event) => { hidePageEditDialog(); console.log('add div') }),
                createButton('Save', (event) => { hidePageEditDialog(); savePage() }),
            ],
        )
    }

    function createElement(tagName, attributes, children) {
        const element = document.createElement(tagName)
        if (attributes) {
            for (key in attributes) {
                element[key] = attributes[key]
            }
        }
        if (children) {
            element.append(...children)
        }
        return element
    }

    function createButton(innerText, onclick) {
        return createElement('button', { innerText, onclick })
    }

    return { editPage, savePage }
}
