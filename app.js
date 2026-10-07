// =====================================================
// CONFIGURACIÓN SUPABASE
// =====================================================

const SUPABASE_URL = "https://axagmwmaurzjjslwtuwq.supabase.co";

const SUPABASE_KEY = "sb_publishable_MuCbkugeTpQaN61ADF7ynA_r2RFQuFF";


const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


// =====================================================
// INICIO
// =====================================================

document.addEventListener("DOMContentLoaded", () => {

    console.log("Aplicación iniciada");

    cargarClientes();

    const formulario = document.getElementById("formCliente");

    if (formulario) {

        formulario.addEventListener(
            "submit",
            guardarCliente
        );

    }

});


// =====================================================
// CARGAR CLIENTES
// =====================================================

async function cargarClientes() {

    const tabla = document.getElementById("tablaClientes");

    if (!tabla) {
        return;
    }


    tabla.innerHTML = `
        <tr>
            <td colspan="7" style="text-align:center;">
                Cargando clientes...
            </td>
        </tr>
    `;


    const { data, error } = await supabaseClient
        .from("clientes")
        .select("*")
        .order("fecha_registro", {
            ascending: false
        });


    if (error) {

        console.error(
            "Error cargando clientes:",
            error
        );


        tabla.innerHTML = `
            <tr>
                <td colspan="7" style="text-align:center;color:red;">
                    Error cargando clientes
                </td>
            </tr>
        `;

        return;
    }


    if (!data || data.length === 0) {

        tabla.innerHTML = `
            <tr>
                <td colspan="7" style="text-align:center;">
                    No hay clientes registrados
                </td>
            </tr>
        `;

        return;
    }


    tabla.innerHTML = "";


    data.forEach(cliente => {

        const fila = document.createElement("tr");


        fila.innerHTML = `

            <td>
                ${escapeHTML(cliente.documento || "")}
            </td>

            <td>
                ${escapeHTML(cliente.nombre || "")}
            </td>

            <td>
                ${formatearFecha(cliente.fecha_nacimiento)}
            </td>

            <td>
                ${escapeHTML(cliente.telefono || "")}
            </td>

            <td>
                ${escapeHTML(cliente.email || "")}
            </td>

            <td>
                ${formatearFecha(cliente.fecha_registro)}
            </td>

            <td>

                <button
                    class="btn-action"
                    onclick="editarCliente('${cliente.id}')">

                    Editar

                </button>


                <button
                    class="btn-action btn-danger"
                    onclick="eliminarCliente('${cliente.id}')">

                    Eliminar

                </button>

            </td>

        `;


        tabla.appendChild(fila);

    });

}


// =====================================================
// ABRIR MODAL
// =====================================================

function abrirModalCliente() {

    document.getElementById("modalCliente")
        .classList.add("active");


    document.getElementById("tituloModalCliente")
        .textContent = "Agregar cliente";


    document.getElementById("formCliente")
        .reset();


    document.getElementById("clienteId")
        .value = "";

}


// =====================================================
// CERRAR MODAL
// =====================================================

function cerrarModalCliente() {

    document.getElementById("modalCliente")
        .classList.remove("active");

}


// =====================================================
// GUARDAR CLIENTE
// =====================================================

async function guardarCliente(event) {

    event.preventDefault();


    const id =
        document.getElementById("clienteId").value;


    const cliente = {

        documento:
            document.getElementById("documento").value.trim(),

        nombre:
            document.getElementById("nombre").value.trim(),

        fecha_nacimiento:
            document.getElementById("fechaNacimiento").value || null,

        telefono:
            document.getElementById("telefono").value.trim(),

        email:
            document.getElementById("email").value.trim(),

        direccion:
            document.getElementById("direccion").value.trim(),

        observaciones:
            document.getElementById("observaciones").value.trim()

    };


    if (!cliente.documento || !cliente.nombre) {

        alert(
            "El documento y el nombre son obligatorios."
        );

        return;
    }


    let resultado;


    // =============================================
    // EDITAR
    // =============================================

    if (id) {

        resultado = await supabaseClient
            .from("clientes")
            .update(cliente)
            .eq("id", id);

    }


    // =============================================
    // CREAR
    // =============================================

    else {

        resultado = await supabaseClient
            .from("clientes")
            .insert([cliente]);

    }


    if (resultado.error) {

        console.error(
            "Error guardando cliente:",
            resultado.error
        );


        alert(
            "No se pudo guardar el cliente:\n\n" +
            resultado.error.message
        );

        return;
    }


    alert(
        id
            ? "Cliente actualizado correctamente."
            : "Cliente agregado correctamente."
    );


    cerrarModalCliente();


    await cargarClientes();

}


// =====================================================
// EDITAR CLIENTE
// =====================================================

async function editarCliente(id) {

    const { data, error } = await supabaseClient
        .from("clientes")
        .select("*")
        .eq("id", id)
        .single();


    if (error) {

        console.error(
            "Error buscando cliente:",
            error
        );

        alert("No se pudo cargar el cliente.");

        return;
    }


    document.getElementById("clienteId")
        .value = data.id;


    document.getElementById("documento")
        .value = data.documento || "";


    document.getElementById("nombre")
        .value = data.nombre || "";


    document.getElementById("fechaNacimiento")
        .value = data.fecha_nacimiento || "";


    document.getElementById("telefono")
        .value = data.telefono || "";


    document.getElementById("email")
        .value = data.email || "";


    document.getElementById("direccion")
        .value = data.direccion || "";


    document.getElementById("observaciones")
        .value = data.observaciones || "";


    document.getElementById("tituloModalCliente")
        .textContent = "Editar cliente";


    document.getElementById("modalCliente")
        .classList.add("active");

}


// =====================================================
// ELIMINAR CLIENTE
// =====================================================

async function eliminarCliente(id) {

    const confirmar = confirm(
        "¿Seguro que deseas eliminar este cliente?"
    );


    if (!confirmar) {
        return;
    }


    const { error } = await supabaseClient
        .from("clientes")
        .delete()
        .eq("id", id);


    if (error) {

        console.error(
            "Error eliminando cliente:",
            error
        );


        alert(
            "No se pudo eliminar el cliente:\n\n" +
            error.message
        );

        return;
    }


    alert(
        "Cliente eliminado correctamente."
    );


    await cargarClientes();

}


// =====================================================
// FORMATEAR FECHA
// =====================================================

function formatearFecha(fecha) {

    if (!fecha) {
        return "-";
    }


    const fechaObj = new Date(fecha);


    if (isNaN(fechaObj)) {
        return fecha;
    }


    return fechaObj.toLocaleDateString(
        "es-CO"
    );

}


// =====================================================
// SEGURIDAD PARA TEXTO HTML
// =====================================================

function escapeHTML(texto) {

    return String(texto)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}