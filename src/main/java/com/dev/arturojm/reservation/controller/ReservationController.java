package com.dev.arturojm.reservation.controller;

import com.dev.arturojm.reservation.entity.Reservation;
import com.dev.arturojm.reservation.service.ReservationService;
import java.net.URI;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.util.UriComponentsBuilder;

@RestController
@RequestMapping("/reservas")
public class ReservationController {

	private final ReservationService reservationService;

	public ReservationController(ReservationService reservationService) {
		this.reservationService = reservationService;
	}

	@GetMapping
	public List<Reservation> listReservations() {
		return reservationService.getAllReservations();
	}

	@PostMapping
	public ResponseEntity<Reservation> createReservation(@RequestBody Reservation reservation,
			UriComponentsBuilder uriComponentsBuilder) {
		Reservation savedReservation = reservationService.createReservation(reservation);
		URI location = uriComponentsBuilder.path("/reservas/{id}")
				.buildAndExpand(savedReservation.getId())
				.toUri();

		return ResponseEntity.created(location).body(savedReservation);
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> cancelReservation(@PathVariable Long id) {
		reservationService.cancelReservation(id);
		return ResponseEntity.noContent().build();
	}
}
