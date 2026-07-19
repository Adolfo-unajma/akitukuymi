# Manual de Usuario — Cliente

## 1. Introducción

Akitukuymi es una tienda en línea de tejidos artesanales hechos a mano (chompas, gorros, amigurumis, mantas, ramos tejidos, accesorios y venta de lanas) elaborados en Pacucha, Andahuaylas (Apurímac, Perú). Este manual está dirigido a las personas que visitan la plataforma para explorar productos, realizar compras y dar seguimiento a sus pedidos. La aplicación se encuentra publicada en `https://akitukuymi.vercel.app` y funciona desde cualquier navegador moderno de computadora o dispositivo móvil, sin necesidad de instalar programas adicionales.

El presente documento describe únicamente las funcionalidades disponibles para el rol *cliente*. Las tareas de gestión (productos, pedidos, usuarios) corresponden al *Manual de Administrador*.

## 2. Requisitos para el uso

Para utilizar la plataforma el cliente necesita:

- Un dispositivo con acceso a Internet (computadora, tableta o teléfono).
- Un navegador web actualizado (Chrome, Edge, Firefox, Safari o Brave).
- Un correo electrónico válido para registrarse (solo si desea comprar).
- La aplicación de Yape para efectuar el pago de los pedidos.

No se requiere instalación: basta con abrir la dirección web de la tienda.

## 3. Estructura general de la interfaz

La navegación se organiza mediante una barra superior fija (navbar) presente en todas las páginas públicas, y un pie de página (footer) con información de contacto y enlaces de ayuda. La barra superior contiene el logotipo de la marca, los accesos a *Inicio*, *Catálogo* y *Ofertas*, el ícono del carrito con el número de productos agregados y el acceso a la cuenta del usuario.

**Figura 1.**

*Página de inicio de la tienda Akitukuymi con la barra de navegación y la sección principal.*

[INSERTAR CAPTURA de la página de inicio `https://akitukuymi.vercel.app`]

*Fuente:* Elaboración propia.

## 4. Recorrido por la tienda

### 4.1. Página de inicio

La página de inicio presenta una sección principal (hero) con el mensaje de la marca, accesos directos al catálogo y al pedido personalizado por WhatsApp, las categorías disponibles, los productos destacados, la explicación de cómo comprar en cuatro pasos, la tabla de precios de lanas y la sección "Nosotros". Toda la información de productos y precios mostrada proviene de la base de datos real de la tienda.

### 4.2. Catálogo de productos

El acceso *Catálogo* muestra todos los productos activos. La página incluye un panel lateral de filtros que permite:

- **Buscar** un producto por nombre.
- **Filtrar por categoría** (chompas, gorros, amigurumis, mantas, ramos tejidos, accesorios).
- **Ver solo ofertas**, es decir, los productos con precio rebajado.
- **Ordenar** los resultados por más recientes, precio de menor a mayor o de mayor a menor.

Mientras la información se carga, la interfaz muestra marcadores de posición animados (skeletons) para indicar que el contenido está en proceso de carga.

**Figura 2.**

*Catálogo de productos con el panel de filtros y las tarjetas de producto.*

[INSERTAR CAPTURA de la ruta `/catalogo`]

*Fuente:* Elaboración propia.

### 4.3. Ficha de producto

Al seleccionar un producto se abre su ficha detallada, que presenta la imagen ampliada, la categoría, el nombre, el precio (y el precio anterior tachado cuando está en oferta), la disponibilidad de stock, la descripción y las opciones de compra. Desde esta pantalla el cliente puede ajustar la cantidad, agregar el producto al carrito o realizar una consulta directa por WhatsApp. Al final se muestran productos relacionados de la misma categoría.

**Figura 3.**

*Ficha de detalle de un producto con las opciones de cantidad y compra.*

[INSERTAR CAPTURA de la ruta `/catalogo/:id` (por ejemplo, "Manta de lana trenzada")]

*Fuente:* Elaboración propia.

## 5. Registro e inicio de sesión

Para completar una compra el cliente debe contar con una cuenta. El registro se realiza desde el enlace *Regístrate gratis* o directamente en `/registro`, ingresando nombres, apellidos, celular, correo electrónico y contraseña. El inicio de sesión se efectúa en `/login` con el correo y la contraseña. La plataforma también contempla el acceso mediante cuenta de Google.

**Nota importante sobre el correo:** el correo utilizado en el registro debe ser real y capaz de recibir mensajes, ya que el sistema de autenticación valida el dominio del correo. Si el registro falla, la aplicación indica el motivo exacto (correo inválido, correo ya registrado, contraseña débil o límite de correos alcanzado).

**Figura 4.**

*Formulario de inicio de sesión.*

[INSERTAR CAPTURA de la ruta `/login`]

*Fuente:* Elaboración propia.

## 6. Carrito de compras

El carrito conserva los productos seleccionados mientras el cliente navega, incluso si recarga la página, gracias al almacenamiento local del navegador. En el carrito (`/carrito`) el cliente puede:

- Aumentar o disminuir la cantidad de cada producto (respetando el stock disponible).
- Eliminar un producto.
- Ver el subtotal por producto y el total general.
- Continuar con la compra o vaciar el carrito.

El botón *Continuar compra* conduce al proceso de pago; si el cliente no ha iniciado sesión, la plataforma lo dirige primero al inicio de sesión y luego retoma la compra.

**Figura 5.**

*Carrito de compras con el resumen del pedido.*

[INSERTAR CAPTURA de la ruta `/carrito` con productos agregados]

*Fuente:* Elaboración propia.

## 7. Proceso de compra y pago

El proceso de finalización de compra (checkout) se organiza en tres pasos claramente identificados mediante un indicador de progreso.

**Tabla 1**

*Pasos del proceso de compra*

| Paso | Nombre | Acciones del cliente |
|------|--------|----------------------|
| 1 | Envío | Selecciona una dirección guardada o registra una nueva (nombre de quien recibe, celular, ciudad, distrito, dirección y referencia). |
| 2 | Pago | Escanea el código QR de Yape, ingresa el número de operación y sube la captura del comprobante de pago. |
| 3 | Listo | Recibe la confirmación con el número de pedido y accede al seguimiento. |

*Nota.* El único método de pago disponible en la plataforma es Yape. El costo y tiempo de envío se coordinan por WhatsApp según la ciudad. Elaboración propia.

**Figura 6.**

*Paso de pago del checkout con el código QR de Yape y la carga del comprobante.*

[INSERTAR CAPTURA del paso 2 de la ruta `/checkout`]

*Fuente:* Elaboración propia.

## 8. Seguimiento de pedidos

Una vez registrado el pedido, el cliente puede consultar su estado en *Mis pedidos* (`/mis-pedidos`), donde aparece el listado de todas sus compras con el número de pedido, la fecha, el estado y el monto. Al abrir un pedido se muestra una línea de tiempo con el avance del mismo.

**Tabla 2**

*Estados del pedido y su significado para el cliente*

| Estado | Significado |
|--------|-------------|
| Pago pendiente | Aún no se ha subido el comprobante de Yape. |
| Verificando pago | El comprobante fue recibido y está en revisión. |
| Confirmado | El pago fue verificado y el pedido entró en preparación. |
| Empaquetado | El pedido está listo para salir. |
| En camino | El pedido va en camino a la dirección indicada. |
| Entregado | El pedido fue recibido por el cliente. |
| Cancelado | El pedido fue anulado por el cliente o por un problema con el pago. |

*Nota.* El cliente puede cancelar su pedido únicamente cuando se encuentra en los estados "Pago pendiente" o "Verificando pago". Elaboración propia.

**Figura 7.**

*Detalle de un pedido con la línea de tiempo de estados.*

[INSERTAR CAPTURA de la ruta `/mis-pedidos/:id`]

*Fuente:* Elaboración propia.

## 9. Perfil y direcciones

En *Mi perfil* (`/perfil`) el cliente puede actualizar sus datos personales (nombres, apellidos, celular y DNI) y administrar sus direcciones de envío: agregar nuevas, marcar una como principal o eliminarlas. El correo electrónico no puede modificarse porque identifica la cuenta.

## 10. Asistente virtual (chatbot)

En la esquina inferior derecha de la tienda se encuentra la mascota de la marca, que da acceso al asistente virtual "Akita". El asistente responde consultas sobre productos, precios, disponibilidad, formas de pago, envíos, estado de pedidos (mediante el número de pedido) y datos de contacto. La mascota reacciona de forma animada según la interacción: permanece en reposo cuando el chat está cerrado, presta atención mientras el cliente escribe, muestra espera mientras procesa y "conversa" al entregar la respuesta.

**Figura 8.**

*Ventana del asistente virtual con la mascota de la marca.*

[INSERTAR CAPTURA del chatbot abierto en `https://akitukuymi.vercel.app`]

*Fuente:* Elaboración propia.

## 11. Recomendaciones de uso

- Ingresar siempre por la dirección oficial `https://akitukuymi.vercel.app`.
- Utilizar un correo real al registrarse.
- Conservar el número de operación de Yape y el número de pedido para cualquier consulta.
- Ante cualquier inconveniente con el pago o el envío, comunicarse por WhatsApp al **+51 977 477 674**.

## 12. Referencias

Google. (2024). *Chrome browser help*. https://support.google.com/chrome

Yape. (2024). *Centro de ayuda de Yape*. Banco de Crédito del Perú. https://www.yape.com.pe
