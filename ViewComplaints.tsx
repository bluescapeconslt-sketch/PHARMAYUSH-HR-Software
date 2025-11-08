import React, { useState, useEffect } from 'react';
import Card from './common/Card.tsx';
import Modal from './common/Modal.tsx';
import { getComplaints, updateComplaintStatus, deleteComplaint } from '../services/complaintService.ts';
import { Complaint } from '../types.ts';

const ViewComplaints: React.FC = () => {
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    const fetchComplaints = async () => {
        setIsLoading(true);
        try {
            const data = await getComplaints();
            const sortedComplaints = data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            setComplaints(sortedComplaints);
        } catch (error) {
            console.error("Failed to fetch complaints", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchComplaints();
    }, []);

    const handleViewDetails =