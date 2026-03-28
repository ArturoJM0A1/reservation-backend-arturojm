package com.dev.arturojm.reservation.service;

import com.dev.arturojm.reservation.entity.Reservation;
import com.dev.arturojm.reservation.entity.ReservationStatus;
import com.dev.arturojm.reservation.exception.BusinessRuleException;
import com.dev.arturojm.reservation.repository.ReservationRepository;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class ReservationService {

	private final ReservationRepository reservationRepository;

	public ReservationService(ReservationRepository reservationRepository) {
		this.reservationRepository = reservationRepository;
	}

	public List<Reservation> getAllReservations() {
		return reservationRepository.findAllByOrderByIdAsc();
	}

	public Reservation createReservation(Reservation reservation) {
		reservation.setId(null);
		reservation.setStatus(ReservationStatus.PENDING);
		return reservationRepository.save(reservation);
	}

	public void cancelReservation(Long id) {
		Reservation reservation = reservationRepository.findReservationById(id)
				.orElseThrow(() -> new BusinessRuleException("No existe una reserva con id " + id + "."));

		reservation.setStatus(ReservationStatus.CANCELLED);
		reservationRepository.save(reservation);
	}
}
