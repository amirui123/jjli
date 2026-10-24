/*
 * Illustrator MCP Vision - ExtendScript host layer.
 *
 * Everything the panel runs goes through __mcp_exec. The constraints baked in:
 *
 *  1. ExtendScript is ES3 - no native JSON, hence the polyfill.
 *  2. `return` is illegal at top level, so every payload is a function call.
 *  3. A script error Illustrator decides to show is a MODAL alert, and it
 *     blocks every later call until a human clicks OK. userInteractionLevel
 *     is set to DONTDISPLAYALERTS for the whole op and restored afterwards,
 *     and every error is caught and serialized rather than left to escape.
 *  4. CSInterface.evalScript collapses any failure to "EvalScript error.",
 *     so errors must be serialized here or they are lost.
 *  5. app.coordinateSystem is global app state. It is pinned to document
 *     space for the op (see util.jsx) and put back, so a user's own scripts
 *     are not left in a frame they did not choose.
 *
 * Undo: Illustrator has no undo-group API, but one script evaluation is one
 * undo step - measured on 30.8.1, three items created in one run were removed
 * by a single undo. So an agent's batch is one Cmd-Z without any bracketing.
 */

#include "../json-polyfill.jsx"
#include "./util.jsx"
#include "./ops-query.jsx"
#include "./ops-build.jsx"
#include "./ops-mutate.jsx"
#include "./ops-layout.jsx"
#include "./ops-capture.jsx"
#include "./ops-diagnostics.jsx"
#include "./ops.jsx"

// Set on every evaluation of this file, so a reload can be PROVEN by the stamp
// changing rather than assumed from a call that returned without error.
var __mcp_loadedAt = new Date().getTime();

function __mcp_serialize(obj) {
    try {
        return JSON.stringify(obj);
    } catch (e) {
        var s = '{"ok":false,"error":{"code":"serialize_failed","message":"';
        s += String(e).replace(/"/g, "'");
        s += '"}}';
        return s;
    }
}

/*
 * Uuids are small per-document integers, so one read in document A and then
 * written after the user switched to B resolves to an unrelated item in B -
 * and the write succeeds. A caller that passes `document` (the name from
 * sessionInfo) is refused instead when another document is active, and every
 * result says which document it ran in, so a mismatch is at least visible.
 */
function __mcp_wrongDocument(args) {
    if (!args || args.document === undefined || args.document === null) { return null; }
    if (!app.documents.length) { return "No document is open; expected '" + args.document + "'"; }
    var active = app.activeDocument.name;
    return active === String(args.document) ? null :
        "The active document is '" + active + "', not '" + args.document + "' - nothing was changed. " +
        "Switch with ai_document activate, or re-read uuids in this document.";
}

function __mcp_stampDocument(op, result) {
    // document ops change which document is active, and say so themselves.
    if (op === "document" || !result || typeof result !== "object" || result instanceof Array) { return; }
    if (result.document !== undefined || !app.documents.length) { return; }
    try { result.document = app.activeDocument.name; } catch (e) {}
}

function __mcp_err(code, message, line) {
    // An Error's String() is "Error: <message>"; the prefix is noise to a caller.
    var text = (message && message.message !== undefined) ? message.message : String(message);
    return { ok: false, error: { code: code, message: String(text), line: line } };
}

/**
 * Single entry point. Takes a JSON request string, always returns a JSON string.
 * Never throws, never lets an alert escape.
 */
function __mcp_exec(reqJson) {
    var out;
    var priorLevel = null, priorCoords = null;

    try {
        try { priorLevel = app.userInteractionLevel; } catch (e) {}
        app.userInteractionLevel = UserInteractionLevel.DONTDISPLAYALERTS;
        try { priorCoords = app.coordinateSystem; } catch (e) {}
        app.coordinateSystem = CoordinateSystem.DOCUMENTCOORDINATESYSTEM;

        var req = null;
        try {
            req = JSON.parse(reqJson);
        } catch (e) {
            out = __mcp_err("bad_request", "Request was not valid JSON: " + String(e), __mcp_line(e));
        }

        if (req) {
            var op = req.op;
            var args = req.args || {};
            if (!__mcp_ops.hasOwnProperty(op)) {
                out = __mcp_err("unknown_op", "No such op: " + op);
            } else if (__mcp_wrongDocument(args)) {
                out = __mcp_err("wrong_document", __mcp_wrongDocument(args));
            } else {
                try {
                    out = { ok: true, result: __mcp_ops[op](args) };
                    __mcp_stampDocument(op, out.result);
                } catch (e) {
                    out = __mcp_err("op_failed", e, __mcp_line(e));
                }
            }
        }
    } catch (e) {
        out = __mcp_err("host_failed", e, __mcp_line(e));
    }

    if (priorCoords !== null) { try { app.coordinateSystem = priorCoords; } catch (e) {} }

    var body;
    try {
        if (!out || out.ok === undefined) { out = __mcp_err("no_result", "op produced nothing"); }
        body = __mcp_serialize(out);
    } catch (e) {
        body = '{"ok":false,"error":{"code":"fatal","message":"serialize threw"}}';
    }

    if (priorLevel !== null) { try { app.userInteractionLevel = priorLevel; } catch (e) {} }
    return body;
}
