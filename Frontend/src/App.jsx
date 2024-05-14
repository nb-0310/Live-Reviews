import React, { useState, useEffect } from 'react'
import io from 'socket.io-client'

// const socket = io('http://localhost:4000')
const socket = io('https://live-reviews.onrender.com')

const App = () => {
	const [reviews, setReviews] = useState([])
	const [newReview, setNewReview] = useState({ title: '', content: '' })

	useEffect(() => {
		fetchReviews()

		socket.on('new_review', handleNewReview)
		socket.on('review_updated', handleReviewUpdated)
		socket.on('review_deleted', handleReviewDeleted)

		return () => {
			socket.disconnect()
		}
	}, [])

	const fetchReviews = async () => {
		try {
			console.log('trying to fetch')
			const response = await fetch('https://live-reviews.onrender.com/reviews')
			if (!response.ok) {
				throw new Error('Failed to fetch reviews')
			}
			const data = await response.json()
			setReviews(data)
		} catch (error) {
			console.error('Error fetching reviews:', error)
		}
	}

	const handleNewReview = (newReview) => {
		// console.log(newReview)
		setReviews((prevReviews) => [newReview, ...prevReviews])
	}

	const handleReviewUpdated = (updatedReview) => {
		setReviews((prevReviews) =>
			prevReviews.map((review) =>
				review._id === updatedReview._id ? updatedReview : review
			)
		)
	}

	const handleReviewDeleted = (deletedReview) => {
		console.log('Socket kaam kar raha hai')
		setReviews((prevReviews) =>
			prevReviews.filter((review) => review._id !== deletedReview._id)
		)
	}

	const handleSubmit = async (e) => {
		e.preventDefault()
		try {
			const id = reviews.length + 1
			const response = await fetch('https://live-reviews.onrender.com/reviews', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					id,
					title: newReview.title,
					content: newReview.content,
				}),
			})
			if (!response.ok) {
				throw new Error('Failed to add review')
			}
			socket.emit(
				'added_review',
				JSON.stringify({
					id,
					title: newReview.title,
					content: newReview.content,
				})
			)
			setNewReview({ title: '', content: '' })
		} catch (error) {
			console.error('Error adding review:', error)
		}
	}

	const handleEdit = async (id, updatedReview) => {
		try {
			const response = await fetch(`https://live-reviews.onrender.com/${id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(updatedReview),
			})
			if (!response.ok) {
				throw new Error('Failed to update review')
			}
		} catch (error) {
			console.error('Error updating review:', error)
		}
	}

	const handleDelete = async (id) => {
		try {
			const response = await fetch(`https://live-reviews.onrender.com/${id}`, {
				method: 'DELETE',
			})
			if (!response.ok) {
				throw new Error('Failed to delete review')
			}
		} catch (error) {
			console.log('Error deleting review:', error)
		}
	}

	return (
		<div>
			<h1>Reviews App</h1>
			<h2>New Review</h2>
			<form onSubmit={handleSubmit}>
				<div>
					<label>Title:</label>
					<input
						type="text"
						value={newReview.title}
						onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
						required
					/>
				</div>
				<div>
					<label>Content:</label>
					<textarea
						value={newReview.content}
						onChange={(e) => setNewReview({ ...newReview, content: e.target.value })}
						required
					></textarea>
				</div>
				<button type="submit">Save</button>
			</form>

			<h2>Reviews</h2>
			<table>
				<thead>
					<tr>
						<th>#</th>
						<th>Title</th>
						<th>Content</th>
						<th>Date-time</th>
						<th>Edit</th>
						<th>Delete</th>
					</tr>
				</thead>
				<tbody>
					{reviews.map((review, index) => (
						<tr key={review._id}>
							<td>{index + 1}</td>
							<td>{review.title}</td>
							<td>{review.content}</td>
							<td>{new Date(review.createdAt).toLocaleString()}</td>
							<td>
								<button
									onClick={() =>
										handleEdit(review._id, {
											title: 'Updated Title',
											content: 'Updated Content',
										})
									}
								>
									Edit
								</button>
							</td>
							<td>
								<button onClick={() => handleDelete(review._id)}>Delete</button>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	)
}

export default App
