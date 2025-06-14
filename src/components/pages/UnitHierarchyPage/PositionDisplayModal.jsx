// PositionDetailsModal.jsx
const PositionDetailsModal = ({ position, onClose }) => {
    const [fullPosition, setFullPosition] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadPositionDetails();
    }, [position.id]);

    const loadPositionDetails = async () => {
        try {
            const response = await api.get(`/units/positions/${position.id}/`);
            setFullPosition(response.data);
        } catch (error) {
            console.error('Failed to load position details:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen onClose={onClose} size="lg">
            <ModalHeader>
                <h2>Position Details</h2>
            </ModalHeader>
            <ModalBody>
                {loading ? (
                    <LoadingSpinner />
                ) : fullPosition && (
                    <div className="position-details">
                        {/* Position Information */}
                        <section className="detail-section">
                            <h3>Position Information</h3>
                            <div className="detail-grid">
                                <DetailItem label="Title" value={fullPosition.display_title} />
                                <DetailItem label="Role" value={fullPosition.role.name} />
                                <DetailItem label="Category" value={fullPosition.role.category} />
                                <DetailItem label="Unit" value={fullPosition.unit.name} />
                            </div>
                        </section>

                        {/* Current Assignment */}
                        {fullPosition.current_assignments.length > 0 && (
                            <section className="detail-section">
                                <h3>Current Assignment</h3>
                                {fullPosition.current_assignments.map(assignment => (
                                    <AssignmentCard key={assignment.id} assignment={assignment} />
                                ))}
                            </section>
                        )}

                        {/* Requirements */}
                        <section className="detail-section">
                            <h3>Requirements</h3>
                            <div className="requirements-list">
                                {fullPosition.effective_requirements.min_rank && (
                                    <RequirementItem
                                        icon={<ChevronRight />}
                                        label="Minimum Rank"
                                        value={fullPosition.effective_requirements.min_rank.name}
                                    />
                                )}
                                {/* Add other requirements */}
                            </div>
                        </section>

                        {/* Assignment History */}
                        <section className="detail-section">
                            <h3>Assignment History</h3>
                            <div className="history-timeline">
                                {fullPosition.assignment_history.map(assignment => (
                                    <HistoryItem key={assignment.id} assignment={assignment} />
                                ))}
                            </div>
                        </section>
                    </div>
                )}
            </ModalBody>
        </Modal>
    );
};