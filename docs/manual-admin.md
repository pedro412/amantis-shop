# Manual del Admin — A'Mantis

Esta guía te lleva paso a paso por todo lo que puedes hacer desde el panel de administración. Está pensada para que la abras desde el celular, igual que vas a usar el admin todos los días.

> **Cómo leer esta guía:** las secciones están en el orden que vas a usar más seguido (primero entrar, después subir productos, al final cosas que se hacen una vez al mes). Si algo no te queda claro, escríbele a Pedro y lo resolvemos.

---

## Antes de empezar

**Tu sitio:** [amantis.com.mx](https://amantis.com.mx)

**El admin:** [amantis.com.mx/admin/login](https://amantis.com.mx/admin/login)

**Tus credenciales:** te las paso en privado (correo + contraseña). **No las compartas por mensaje, no las pegues en notas del celular sin candado.** Si crees que alguien más las vio, escríbeme y las cambiamos.

**Recomendado:** guarda el admin como acceso directo en la pantalla principal de tu celular para no escribir la URL cada vez.

> 📸 *Aquí va: screenshot de cómo agregar el admin a la pantalla principal del celular (Safari iOS o Chrome Android).*

---

## 1. Iniciar sesión

1. Abre [amantis.com.mx/admin/login](https://amantis.com.mx/admin/login)
2. Escribe tu **correo** y tu **contraseña**
3. Toca **Entrar al panel**

Si todo salió bien, vas a ver el panel principal con tu nombre y la fecha de hoy.

> 📸 *Aquí va: screenshot de la pantalla de login completa.*

**¿No te deja entrar?**
- Verifica que el correo no tenga espacios al inicio/final (autocorrector)
- Las mayúsculas/minúsculas del correo no importan
- La contraseña sí distingue mayúsculas
- Si copiaste la contraseña desde un mensaje, asegúrate de no pegar un espacio extra

---

## 2. Si olvidaste tu contraseña

1. En la pantalla de login toca **¿Olvidaste tu contraseña?**
2. Escribe tu correo y toca **Enviar instrucciones**
3. Vas a ver un mensaje verde: *"Si esa cuenta existe, te enviamos un correo…"*
4. Abre tu correo (revisa también la carpeta de Spam) y toca el enlace que recibiste
5. Escribe tu **nueva contraseña** (mínimo 8 caracteres) y toca **Guardar contraseña**
6. Inicia sesión de nuevo con la contraseña nueva

> 📸 *Aquí va: la pantalla "Olvidé mi contraseña" + el correo recibido + la pantalla para escribir la nueva contraseña.*

**Tip:** elige una contraseña que recuerdes pero que nadie pueda adivinar. No uses tu nombre, fecha de nacimiento, ni contraseñas que ya usas en otros lados.

---

## 3. El Panel (página principal)

Cuando entras, lo primero que ves es un saludo personalizado y unas tarjetas con números importantes:

- **Productos activos** — cuántos productos están publicados y visibles para tus clientas
- **Stock bajo** — productos con 5 o menos unidades. Toca la tarjeta para ver cuáles
- **Sin imagen** — productos que no tienen ni una foto. Estos no se ven bien en el catálogo, conviene completarlos pronto
- **Categoría eliminada** — productos que se quedaron "huérfanos" porque borraste su categoría. Tócala para reasignarles una nueva

> 📸 *Aquí va: el panel con las 4 tarjetas, indicando con flechas qué significa cada una.*

**Cómo moverte por el admin:** abajo del todo de la pantalla hay 4 botones: **Panel · Productos · Categorías · Ajustes**. Esos son los que vas a usar siempre.

---

## 4. Productos

### 4.1 Subir un producto nuevo

1. Toca **Productos** abajo, después el botón **+ Nuevo** arriba a la derecha
2. Llena cada parte del formulario (los detalles abajo)
3. Cuando termines, toca **Crear producto**

**Las partes del formulario, una por una:**

#### Fotos (hasta 8)
- Toca el cuadro grande para elegir fotos del celular, o arrástralas
- Acepta formatos: JPG, PNG, WebP, HEIC (foto de iPhone)
- La primera foto es la **principal** — la que ven tus clientas en el catálogo. Para cambiar el orden, arrastra las fotos
- Cada foto se comprime automáticamente para que cargue rápido
- Para borrar una, toca la **X** arriba a la derecha de la foto

> 📸 *Aquí va: la galería de fotos con las 4 columnas, mostrando una arrastrada en pleno reordenamiento.*

#### Nombre
El nombre del producto como lo van a ver tus clientas. **Obligatorio**, máximo 120 caracteres.

Ejemplo: *Conjunto encaje Diosa*

#### Slug
Esto es lo que aparece en la dirección web del producto. Se rellena solo cuando escribes el nombre, pero puedes editarlo si quieres una versión más corta. **Solo letras minúsculas, números y guiones**, sin acentos.

Ejemplo: si el nombre es *"Conjunto encaje Diosa"*, el slug se vuelve `conjunto-encaje-diosa` y la dirección queda `amantis.com.mx/producto/conjunto-encaje-diosa`.

#### Descripción corta
Aparece en las tarjetas del catálogo (debajo del nombre). Máximo 200 caracteres. Es opcional pero ayuda mucho a vender.

Ejemplo: *Encaje suave, dos piezas, talla S a XL.*

#### Descripción
La descripción larga, aparece dentro del producto cuando alguien lo abre. Hasta 2000 caracteres. Aquí puedes contar materiales, sensación, talla recomendada, cuidados.

#### Precio (MXN)
**Obligatorio.** Solo el número, sin signo de pesos, sin comas. Si el producto cuesta $599, escribe `599`. Si tiene centavos: `599.50`.

#### Stock
Cuántas unidades tienes. Si vendes todas, déjalo en `0` y aparecerá como **Agotado** en el catálogo.

> Si vas a usar variantes (ver más abajo), este campo desaparece — el stock total se calcula sumando las variantes.

#### Precio antes (opcional)
Si quieres mostrar que está rebajado, escribe el precio anterior aquí. En el catálogo va a aparecer **tachado** junto al precio actual.

Ejemplo: si llenas `799` y el precio es `599`, las clientas ven: ~~$799~~ **$599**.

#### Categoría
**Obligatorio.** Elige una de la lista. Si no encuentras la que necesitas, primero créala desde **Categorías** (sección 5).

#### SKU (opcional)
El código interno que tú usas para identificar el producto en tu inventario. Si no usas códigos, déjalo vacío.

#### Variantes
Si el producto viene en varias **tallas** o **colores** (cada uno con su propio stock), úsalo. Hasta 20 variantes.

1. Toca **+ Agregar variante**
2. Escribe el **Nombre** (ej. *Talla M*, *Color negro*) y el **Stock** de esa variante
3. Si el precio de esa variante es diferente al precio principal, ponlo en **Precio (opcional)**
4. Repite para cada talla/color
5. Para reordenar, arrastra desde el icono de las tres rayas. Para borrar, toca la papelera

Cuando agregas variantes, el campo **Stock** principal se oculta — el total ya se calcula solo.

> 📸 *Aquí va: una sección de variantes con 3 tallas (S, M, L), mostrando el stock total arriba.*

#### Producto activo
Es un interruptor verde/gris.
- **Verde:** publicado, las clientas lo ven en el catálogo
- **Gris:** borrador, solo tú lo ves desde el admin

Útil cuando quieres preparar un producto antes de lanzarlo.

#### Destacado
Otro interruptor.
- **Verde:** aparece en la home y en secciones destacadas. Úsalo para tus mejores vendedores
- **Gris:** se ve normalmente en su categoría

**Cuando termines de llenar todo, toca Crear producto.** Te regresa a la lista y ya estará ahí.

---

### 4.2 Editar un producto

1. Toca **Productos** y busca el producto en la lista (también puedes usar la barra de búsqueda)
2. Toca el producto
3. Cambia lo que necesites
4. Toca **Guardar cambios**

Vas a ver un mensaje verde: *"Cambios guardados."*

**El admin guarda solo los cambios.** Si te equivocas y refrescas la página antes de guardar, los cambios no quedan.

---

### 4.3 Cambiar el stock rápidamente

Por ahora, para cambiar el stock tienes que abrir el producto y editarlo (sección 4.2). No hay botón de "+1 / -1" en la lista.

**Tip para inventario diario:**
1. Desde el Panel, toca **Stock bajo** para ver los que están a punto de agotarse
2. Abre cada uno, ajusta el stock, guarda
3. Si se agotó por completo, lo puedes dejar en `0` (sigue visible como **Agotado**) o **desactivarlo** con el toggle (deja de aparecer)

---

### 4.4 Buscar y filtrar productos

En la pantalla **Productos** tienes:

- **Barra de búsqueda** arriba — escribe parte del nombre y filtra al instante
- **Pestañas:** Todos · Activos · Borradores · Agotados
- **Botón de filtros** (icono de embudo) — abre un panel desde abajo con:
  - Filtro por **Categoría**
  - **Solo stock bajo** (5 o menos)
  - **Sin imagen**
  - **Categoría eliminada** (huérfanos)
  - Botón **Limpiar filtros** para volver a empezar

> 📸 *Aquí va: el panel de filtros desde abajo con un filtro aplicado.*

---

### 4.5 Borrar un producto

Antes de borrar, considera **desactivarlo** (sección 4.1, "Producto activo"). Eso lo oculta del catálogo pero lo deja en el admin por si después quieres volver a venderlo.

Si de verdad quieres borrarlo:

1. Abre el producto
2. Hasta abajo del formulario hay una sección **Zona peligrosa** con un botón rojo **Eliminar producto**
3. Toca el botón, lee la advertencia, confirma

**Importante:** "borrar" en realidad **oculta** el producto del catálogo y del admin, pero los datos quedan guardados en la base de datos. **Si te equivocaste y necesitas recuperarlo, escríbele a Pedro** — él lo puede restaurar manualmente. No hay un botón de "deshacer" en el admin.

---

## 5. Categorías

Las categorías organizan tus productos. Pueden tener **subcategorías** (un solo nivel de profundidad).

Ejemplo de estructura:
- **Lencería** (categoría padre)
  - Conjuntos (subcategoría)
  - Brasieres (subcategoría)
  - Tangas (subcategoría)
- **Juguetes** (categoría padre)
- **Lubricantes** (categoría padre)

### 5.1 Crear una categoría

1. Toca **Categorías** abajo, después **+ Nueva** arriba a la derecha
2. Llena el formulario:

#### Imagen (opcional)
Una sola imagen para representar la categoría en el catálogo. Mismas reglas que las fotos de producto.

#### Nombre
Obligatorio, hasta 80 caracteres. Ejemplo: *Lencería*.

#### Slug
Igual que en productos: se rellena solo, puedes editarlo. Ejemplo: `lenceria`. La dirección queda `amantis.com.mx/categoria/lenceria`.

#### Categoría padre
- Si vas a crear una **categoría principal**, deja la opción **Sin padre (categoría principal)**
- Si vas a crear una **subcategoría**, elige la categoría principal a la que pertenece

#### Descripción
Opcional, hasta 500 caracteres. Aparece arriba del listado de productos cuando alguien entra a esa categoría.

#### Categoría activa
Igual que en productos: verde la hace visible, gris la oculta.

3. Toca **Crear categoría**

---

### 5.2 Editar una categoría

1. Toca **Categorías**, después la categoría que quieres cambiar
2. Si tiene subcategorías, las vas a ver listadas en la parte de abajo
3. Cambia lo que necesites y toca **Guardar cambios**

---

### 5.3 Borrar una categoría

El admin **no te deja borrar** una categoría si:
- **Tiene subcategorías** — primero muévelas a otra categoría padre, o bórralas a ellas primero
- **Tiene productos asignados** — desactívala con el toggle en lugar de borrarla, o reasigna los productos a otra

Cuando esté libre de bloqueos, puedes borrar desde la **Zona peligrosa** al final del formulario. Igual que con productos, en realidad **oculta** la categoría y se puede restaurar contactando a Pedro.

---

## 6. Ajustes — Anuncios

En **Ajustes** puedes mostrar un mensaje en la parte de arriba de todo el sitio. Por ejemplo: *"3 meses sin intereses en compras desde $1,500"*.

> Solo **un anuncio puede estar activo a la vez.** Si activas uno nuevo, el anterior queda como borrador automáticamente.

### 6.1 Crear un anuncio

1. Toca **Ajustes** abajo
2. Escribe el **Mensaje** (máximo 200 caracteres)
3. Decide si lo activas ahora con el toggle **Activo**
4. Toca **Crear anuncio**

> 📸 *Aquí va: el formulario de anuncio + cómo se ve la barra de anuncios en el sitio público.*

### 6.2 Activar / desactivar / editar / borrar

En la lista de anuncios cada fila tiene:
- Un **interruptor** para activar o desactivar
- Un **icono de lápiz** para editar el mensaje
- Un **icono de papelera** para borrar (esta vez sí es definitivo, no se recupera)

**Tip:** si tienes anuncios estacionales (Día de las Madres, Buen Fin, etc.), créalos como **borradores** desde antes y solo prende el que toque cuando llegue la fecha.

---

## 7. Resolución de problemas comunes

### "Subí una foto pero no aparece"

- **Verifica el peso:** las fotos muy pesadas se comprimen, pero algunas pueden tronar. Si una foto pesa más de 10 MB, conviene reducirla antes desde el celular
- **Espera unos segundos:** sobre todo con conexión lenta, la subida toma su tiempo. Verás un mensaje **"Subiendo…"**
- **Refresca la página:** si después de un minuto sigue sin aparecer, refresca y vuelve a intentar

### "Quiero usar el mismo SKU/slug que un producto que borré"

Cuando borras un producto, el SKU y el slug **se liberan automáticamente** y los puedes reusar en uno nuevo.

### "Mi categoría no me deja borrarla"

Lee la advertencia que aparece — te dice exactamente qué la bloquea (subcategorías o productos). Una vez resuelto, vuelves al botón de borrar.

### "Cambié la contraseña pero ahora no entra"

- Asegúrate de no haber dejado un espacio al inicio o final
- Si tu navegador tenía guardada la contraseña vieja, puede que esté autocompletando esa. Bórrala desde la configuración del navegador y escribe la nueva a mano

### "Necesito recuperar un producto borrado"

Escríbele a Pedro con el nombre del producto y la fecha aproximada en que lo borraste. Lo restaura desde la base de datos.

### "Se ve raro un producto en el catálogo público"

Abre el producto en el admin y verifica que tenga:
- Al menos una foto
- Categoría asignada (no debe decir "Categoría eliminada")
- Stock mayor a 0 (a menos que quieras mostrarlo como **Agotado**)
- El interruptor **Producto activo** en verde

---

## 8. Contactos y soporte

Si algo no funciona o tienes dudas:

- **Pedro:** te paso WhatsApp/correo en privado
- **Tiempo de respuesta normal:** mismo día hábil
- **Para urgencias del sitio caído:** mensaje directo

---

## Notas internas (no para Shirley)

> Las siguientes notas son para el equipo técnico. Bórralas antes de exportar el manual a PDF.

- **CSV import:** mencionado en LIT-156/LIT-192 como subtarea, pero **declarado out of scope** durante el alcance V1. No es deuda técnica — fue decisión consciente. No incluir en el manual final. Si Shirley pregunta por carga masiva, abrir ticket V2.
- **Soft delete recovery:** no hay UI para restaurar productos/categorías borrados. La forma actual es manualmente vía Prisma Studio o SQL en la nueva DB de prod (`postgres-nsfe`). Considerar un endpoint de recuperación si Shirley pide muchas restauraciones.
- **Cambio rápido de stock:** la sección 4.3 reconoce que no hay edición inline. Si Shirley se queja del flujo, vale la pena un ticket V2 para un quick-edit en el listado.
- **Sentry/GA4:** no integrados en V1. Sin Sentry, los errores que reporte Shirley son la única señal de problemas en prod.
- **Screenshots:** los marcadores `> 📸 Aquí va: …` son los placeholders donde van las capturas reales desde celular. Hay 9 en total.
