import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:bus_booking_app/t-2-bus-booking-feature/pages/date_pick_page.dart';
import 'package:bus_booking_app/t-2-bus-booking-feature/models/scheduleroute.dart'; // Import your model class

class RouteDetailsScreen extends StatelessWidget {
  final String title;
  final String image;
  final String price;
  final String location;
  final double rating;

  const RouteDetailsScreen({
    super.key,
    required this.title,
    required this.image,
    required this.price,
    required this.location,
    required this.rating,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Colors.blue[900],
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () {
            Navigator.pop(context);
          },
        ),
        title:
            const Text('Route Details', style: TextStyle(color: Colors.white)),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 16.0),
            child: CircleAvatar(
              backgroundImage: Image.asset('assets/images/round_dp.png').image,
            ),
          ),
        ],
      ),
      body: Stack(
        children: [
          // Background Image
          Positioned.fill(
            child: Image.asset(
              'assets/images/mapbg_new.png', // Replace with your image path
              fit: BoxFit.cover,
            ),
          ),
          // Foreground content
          SafeArea(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [

                const Spacer(),

                // Fetch Schedule Route from Firestore and display the "BOOK NOW" button
                StreamBuilder<QuerySnapshot>(
                  stream: (() {
                    final parts = title.split('-');
                    final departure = parts.isNotEmpty ? parts[0].trim() : '';
                    final destination = parts.length > 1 ? parts[1].trim() : '';
                    return FirebaseFirestore.instance
                        .collection('ScheduleRoute')
                        .where('departureLocation', isEqualTo: departure)
                        .where('destinationLocation', isEqualTo: destination)
                        .limit(1)
                        .snapshots();
                  })(),
                  builder: (context, AsyncSnapshot<QuerySnapshot> snapshot) {
                    if (snapshot.hasError) {
                      return const Center(child: Text('Error fetching route details'));
                    }
                    if (snapshot.connectionState == ConnectionState.waiting) {
                      return const Center(child: CircularProgressIndicator());
                    }

                    // Map Firestore data to `ScheduleRoute` object
                    ScheduleRoute schedule;
                    String routeId;

                    if (snapshot.hasData && snapshot.data!.docs.isNotEmpty) {
                      final doc = snapshot.data!.docs.first;
                      schedule = ScheduleRoute.fromFirestore(doc);
                      routeId = doc.id;
                    } else {
                      // Fallback/Mock data to prevent getting stuck if database is empty or not configured yet
                      final parts = title.split('-');
                      final departure = parts.isNotEmpty ? parts[0].trim() : '';
                      final destination = parts.length > 1 ? parts[1].trim() : '';
                      schedule = ScheduleRoute(
                        routeId: 'mock_route_id',
                        departureLocation: departure,
                        destinationLocation: destination,
                        departureTime: '08:30 AM',
                        destinationTime: '11:00 AM',
                        seatPrice: 550.0,
                        busNumber: 'NP-5541',
                        journeyDuration: '2h 30m',
                      );
                      routeId = 'mock_route_id';
                    }

                    return Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(20),
                          boxShadow: const [
                            BoxShadow(
                              color: Colors.black12,
                              blurRadius: 10,
                              spreadRadius: 2,
                            ),
                          ],
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // Route and Location Details
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  title,
                                  style: const TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                Text(
                                  '244 km', // Distance placeholder
                                  style: TextStyle(
                                    fontSize: 16,
                                    color: Colors.grey[600],
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 10),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      location.split('-')[0], // Starting point
                                      style: const TextStyle(
                                        fontSize: 16,
                                        fontWeight: FontWeight.bold,
                                        color: Colors.green,
                                      ),
                                    ),
                                    Text(
                                      '06:00 AM', // Placeholder for departure time
                                      style: TextStyle(
                                        fontSize: 14,
                                        color: Colors.grey[600],
                                      ),
                                    ),
                                  ],
                                ),
                                Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      location.split('-')[1], // Ending point
                                      style: const TextStyle(
                                        fontSize: 16,
                                        fontWeight: FontWeight.bold,
                                        color: Colors.green,
                                      ),
                                    ),
                                    Text(
                                      '11:00 AM', // Placeholder for arrival time
                                      style: TextStyle(
                                        fontSize: 14,
                                        color: Colors.grey[600],
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                            const SizedBox(height: 16),

                            // "BOOK NOW" button
                            Center(
                              child: ElevatedButton(
                                style: ElevatedButton.styleFrom(
                                  padding: const EdgeInsets.symmetric(
                                      vertical: 16, horizontal: 100),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  backgroundColor: Colors.blue[700],
                                ),
                                onPressed: () {
                                  Navigator.push(
                                    context,
                                    MaterialPageRoute(
                                      builder: (context) => DatePickerPage(
                                        seatPrice: schedule.seatPrice ?? 0.0, // Pass the seatPrice
                                        routeId: routeId, // Pass the dynamic/mock routeId
                                      ),
                                    ),
                                  );
                                },
                                child: const Text(
                                  'BOOK NOW',
                                  style: TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.bold,
                                    color: Colors.white,
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
