# Actualmente la ite-card class de css no me gusta, tiene 4 filas al desplegar todos los elementos , quiero dejarla en dos filas.

- ## primera file:

  La primera fila mostrará alineado a la izquierda un icono mostrando si es un spell o un grimoire (weblinks): - El icono para spell será esteel spell.svg añadido ya a src/web/assets/icons - El icono para grimoire será esteel grimoire.svg añadido ya a src/web/assets/icons

  A continuacion a su derecha y tambien alineado a la izquierda se mostrará el titulo del spell o grimoire , con strong text strong text y con una fuente germania one que cojeremos de aqui:
  `     <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Germania+One&display=swap" rel="stylesheet">
      `
  A continuacion a la derecha de ste titlo y alineados a la derecha se agregaran los tags cada uno con su texto y color

- ## Segunda fila:

  Al igual que ahora la segunda fila tendra la caja con el comando en su elemento code pero este elemento solo ocupara el 75% del ancho en el 25% restante seguido al codigo del spell o al weblink tendremos alineados a la derecha: - En el extremo derecho de la fila el boton de copy con el icono copy.svg en src/web/assets/icons. - A la izquierda del icono copy pero alineado a la derecha tambien el boton de editar elemento con el icono edit.svg - A la izquierda del icono edit pero alineado a la derecha tambien el boton de eliminar elemento con el icono delete.svg

  Los botones de up and down para cada elemento fuera ya de la card utilizaran respectivamente los iconos up-arrow.svg y down-arrow.svg

- Tambien en la caja de los tags de tipo fielset el texto del tag y su checkbutton estan muy separados , ponlos juntos y pon todos los tags en la linea misma linea en un flex container con ligeara separacion horizontal entre ellos

- El selector de modos light y dark estará al extremo derecho en la misma posicion que esta ahora pero usara los dos iconos sun.svg para el modo light y moon.svg para el modo dark
