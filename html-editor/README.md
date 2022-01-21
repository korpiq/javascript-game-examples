# Web game editor

Place div elements on a web page to make screens for your game.

## How to use

1. Copy the [editor.js](editor.js) file into the directory where you want to make web pages.
2. Then copy or create a CSS stylesheet file like [style.css](style.css) there too.
3. Finally copy or create a HTML file like [index.html](index.html) there as well:

```
<!DOCTYPE html>
<html>
    <head>
        <script src="editor.js"></script>
        <link href="style.css" rel="stylesheet">
    </head>

    <body>
    </body>
</html>
```

* The `<script src="editor.js">` tag loads the editor that starts itself after loading.
* The `<link href="style.css" rel="stylesheet">` loads your styles so you can use them on the page.

Right-click on the page to see editor menu. There you can add div elements or save the page.

Click on an element to drag it around by its center or resize by dragging on its right bottom corner.

Right-click on a div element to change its style class (eg. "blue" or "grass" with our example stylesheet), or to add elements inside it.
