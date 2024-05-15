import React, { useState, useEffect } from 'react'
import io from 'socket.io-client'

const socket = io('http://localhost:4000')

const App = () => {
	const [reviews, setReviews] = useState([])
	const [newReview, setNewReview] = useState({ title: '', content: '' })
	const [editReview, setEditReview] = useState(null)

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
			const response = await fetch('http://localhost:4000/reviews')
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
		setReviews((prevReviews) => [newReview, ...prevReviews])
	}

	const handleReviewUpdated = (updatedReview) => {
		setReviews((prevReviews) =>
			prevReviews.map((review) =>
				review._id === updatedReview._id ? updatedReview : review
			)
		)
		setEditReview(null)
	}

	const handleReviewDeleted = (deletedReview) => {
		setReviews((prevReviews) =>
			prevReviews.filter((review) => review._id !== deletedReview._id)
		)
	}

	const handleSubmit = async (e) => {
		e.preventDefault()
		try {
			const response = await fetch('http://localhost:4000/reviews', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					...newReview,
					dateTime: new Date().toISOString(),
				}),
			})
			if (!response.ok) {
				throw new Error('Failed to add review')
			}
			setNewReview({ title: '', content: '' })
		} catch (error) {
			console.error('Error adding review:', error)
		}
	}

	const handleEdit = (review) => {
		setEditReview({
			...review,
			dateTime: new Date().toISOString(),
		})
	}

	const handleSaveEdit = async () => {
		try {
			const response = await fetch(
				`http://localhost:4000/reviews/${editReview._id}`,
				{
					method: 'PUT',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(editReview),
				}
			)
			if (!response.ok) {
				throw new Error('Failed to update review')
			}
		} catch (error) {
			console.error('Error updating review:', error)
		}
	}

	const handleCancelEdit = () => {
		setEditReview(null)
	}

	const handleDelete = async (id) => {
		try {
			const response = await fetch(`http://localhost:4000/reviews/${id}`, {
				method: 'DELETE',
			})
			if (!response.ok) {
				throw new Error('Failed to delete review')
			}
		} catch (error) {
			console.error('Error deleting review:', error)
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
							<td>
								{editReview && editReview._id === review._id ? (
									<input
										type="text"
										value={editReview.title}
										onChange={(e) =>
											setEditReview({ ...editReview, title: e.target.value })
										}
									/>
								) : (
									review.title
								)}
							</td>
							<td>
								{editReview && editReview._id === review._id ? (
									<textarea
										value={editReview.content}
										onChange={(e) =>
											setEditReview({ ...editReview, content: e.target.value })
										}
									></textarea>
								) : (
									review.content
								)}
							</td>
							<td>{new Date(review.dateTime).toLocaleString()}</td>{' '}
							<td>
								{editReview && editReview._id === review._id ? (
									<>
										<button onClick={handleSaveEdit}>Save</button>
										<button onClick={handleCancelEdit}>Cancel</button>
									</>
								) : (
									<button onClick={() => handleEdit(review)}>Edit</button>
								)}
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
