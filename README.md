# 🎨 Giogreys Store App - Frontend Enterprise (React 19 + Vite 8)

Aplicación web cliente desarrollada con estética **Warm Rose Gold & Clean White** de nivel Enterprise para la gestión de inventario, punto de venta multimoneda, arqueo de caja y facturación electrónica de **Giogreys Store**.

---

## ✨ Características y Módulos

1. **Punto de Venta (POS Multimoneda)**:
   - Rejilla interactiva de selección rápida de productos por SKU.
   - Conversión automática e instantánea de la cuenta a **USD ($)**, **Bolívares (VES Bs.)** y **Pesos Colombianos (COP $)**.
   - Selección de cliente o registro de cliente rápido directamente en la caja POS.
   - Procesador de pago con emisión e impresión de recibos/tickets.

2. **Gestión de Inventario & Productos**:
   - Rejilla de productos con control de stock en tiempo real e indicador de **Bajo Stock**.
   - Registro de productos con variantes (Talla, Color, Atributos JSON), SKU único, Costo USD y Precio USD.
   - **Exportación a Excel / CSV** del catálogo completo.

3. **Arqueo & Cierre de Caja POS (Reporte Z)**:
   - Panel de control de apertura y cierre de turno.
   - Auditoría automática de pagos por método (Efectivo USD, Pago Móvil, Zelle, Pesos COP).
   - Formulario de arqueo físico con cálculo instantáneo de cuadre o descuadre de caja.

4. **Historial de Facturación & Métricas Financieras**:
   - Registro de facturas con correlativo **`INV-10001`**, fecha, cliente y total.
   - Reimpresión de comprobantes/tickets pasados.
   - Panel Principal con indicadores de **Ganancia Neta** (`Precio Venta - Costo`).

5. **Configuración & Usuarios (RBAC)**:
   - Ajuste rápido de la **Tasa BCV (Bolívares)** y **Tasa COP**.
   - Gestión de empleados (Roles `admin` / `vendedor`).

---

## 🎨 Paleta de Colores & Diseño

- **Fondo Principal**: `#fff5f8` *(Soft Warm Rose)*
- **Tarjetas y Paneles**: `#ffffff` *(Clean Pure White)*
- **Acentos y Botones**: `#d97706` / `linear-gradient(135deg, #fbbf24, #f59e0b, #d97706)` *(Warm Gold)*
- **Detalles y Pills**: `#cbd5e1` *(Silver Accent)*
- **Tipografía**: `Inter` / `JetBrains Mono`

---

## 🚀 Instalación y Despliegue

```bash
# 1. Instalar dependencias
npm install

# 2. Ejecutar servidor de desarrollo
npm run dev

# 3. Compilar bundle de producción
npm run build
```

---

## 🔒 Repositorio GitHub
[github.com/Gio27709/giogreys-store-frontend](https://github.com/Gio27709/giogreys-store-frontend)
