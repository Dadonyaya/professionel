package com.ram.bagagebackend.controller;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.concurrent.CopyOnWriteArrayList;

@RestController
@RequestMapping("/sse")
public class SseVolController {

    // Liste thread-safe des clients connectés au flux SSE
    private final CopyOnWriteArrayList<SseEmitter> emitters = new CopyOnWriteArrayList<>();

    /**
     * Endpoint à appeler côté front (React) pour écouter les nouveaux vols en temps réel.
     */
    @GetMapping("/vols")
    public SseEmitter streamVols() {
        SseEmitter emitter = new SseEmitter(Long.MAX_VALUE);
        emitters.add(emitter);

        emitter.onCompletion(() -> emitters.remove(emitter));
        emitter.onTimeout(() -> emitters.remove(emitter));
        emitter.onError(e -> emitters.remove(emitter));

        // Optionnel : envoie un “ping” pour maintenir la connexion (peut être commenté)
        try {
            emitter.send(SseEmitter.event().name("INIT").data("connected"));
        } catch (IOException ignore) {}

        return emitter;
    }

    /**
     * Appelle cette méthode côté backend pour notifier tous les clients qu’un vol a changé.
     * Exemple : dans VoyageService après ajout, modification ou suppression de vol.
     */
    public void notifyClients(Object voyage) {
        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event()
                        .name("voyage_update")
                        .data(voyage, MediaType.APPLICATION_JSON)
                );
            } catch (IOException e) {
                emitter.complete();
                emitters.remove(emitter);
            }
        }
    }

    // ---------------------------------------------
    // (Optionnel) Endpoint pour tester en local via curl/postman :
    // POST /sse/test -> pousse un fake event à tous les clients connectés
    // ---------------------------------------------
    @PostMapping("/test")
    public void testNotify(@RequestBody Object voyage) {
        notifyClients(voyage);
    }
}
