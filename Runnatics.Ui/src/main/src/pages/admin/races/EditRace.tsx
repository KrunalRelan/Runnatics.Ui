import { RaceSettings } from "@/main/src/models/races/RaceSettings";
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CreateRaceRequest } from "@/main/src/models/races/CreateRaceRequest";
import { RaceService } from "@/main/src/services/RaceService";
import { RailwayAlert } from "@mui/icons-material";

interface FormErrors {
    [key: string]: string;
}

export const EditRace: React.FC = () => {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { id } = useParams<{ id: string }>();
    const { eventId } = useParams<{ eventId: string }>();
    const [isLoading, setIsLoading] = useState(true);
    const [errors, setErrors] = useState<FormErrors>({});
    const [apiError, setApiError] = useState<string>("");

    // Race Settings state
    const [raceSettings, setRaceSettings] = useState<RaceSettings>({
        id: undefined,
        raceId: undefined,
        published: false,
        sendSms: false,
        checkValidation: false,
        showLeaderboard: false,
        showResultTable: false,
        isTimed: false,
        publichDnf: false,
        hasLoops: false,
        dataHeaders: undefined,
        createdAt: undefined,
    });

    const [formData, setFormData] = useState<CreateRaceRequest>({
        title: "",
        distance: 0,
        description: "",
        startTime: "",
        endTime: "",
        raceSettings: {
            published: false,
            sendSms: false,
            checkValidation: false,
            showLeaderboard: true,
            showResultTable: true,
            isTimed: false,
            publichDnf: false,
            dedUpSeconds: 0,
            earlyStartCutOff: 0,
            lateStartCutOff: 0,
            hasLoops: false,
            loopLength: 0,
            dataHeaders: "",
        }
    });

    // Fetch race data 
    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            try {
                setIsLoading(true);

                // Fetch data 
                const response = await RaceService.getRaceById(eventId!, id!);
                const raceData = response.message;

                if (isMounted) {
                    console.log('📦 Raw race data:', raceData);

                    // Populate form data
                    populateFormData(raceData);
                }
            } catch (error: any) {
                console.error("Error fetching race data:", error);

                if (isMounted) {
                    const errorMessage =
                        error.response?.data?.message ||
                        error.message ||
                        "Failed to load race data. Please try again.";
                    setApiError(errorMessage);
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        if (id) {
            fetchData();
        } else {
            setApiError('No race ID provided');
            setIsLoading(false);
        }

        return () => {
            isMounted = false;
        };
    }, [id]);

    // Populate form data from event object
    const populateFormData = (race: any) => {
        console.log('📋 Populating form with race data:', race);

        const mappedFormData: CreateRaceRequest = {
            title: race.title || "",
            distance: race.distance || 0,
            description: race.description || "",
            startTime: race.startTime || "",
            endTime: race.endTime || "",
            raceSettings: race.raceSettings || {
                published: false,
                sendSms: false,
                checkValidation: false,
                showLeaderboard: true,
                showResultTable: true,
                isTimed: false,
                publichDnf: false,
                dedUpSeconds: 0,
                earlyStartCutOff: 0,
                lateStartCutOff: 0,
                hasLoops: false,
                loopLength: 0,
                dataHeaders: "",
            }
        };

        setFormData(mappedFormData);
        console.log('✅ Form data set:', mappedFormData);

        // Set separate state for raceSettings 
        if (race.raceSettings) {
            const mappedRaceSettings: RaceSettings = {
                id: race.raceSettings.id,
                raceId: race.raceSettings.raceId,
                published: race.raceSettings.published ?? false,
                sendSms: race.raceSettings.sendSms ?? false,
                checkValidation: race.raceSettings.checkValidation ?? false,
                showLeaderboard: race.raceSettings.showLeaderboard ?? false,
                showResultTable: race.raceSettings.showResultTable ?? false,
                isTimed: race.raceSettings.isTimed ?? false,
                publichDnf: race.raceSettings.publichDnf ?? false,
                hasLoops: race.raceSettings.hasLoops ?? false,
                dataHeaders: race.raceSettings.dataHeaders,
                createdAt: race.raceSettings.createdAt,
            };
            setRaceSettings(mappedRaceSettings);
        }
    };

    // Sync event settings and leaderboard settings with formData
    useEffect(() => {
        setFormData((prev) => ({
            ...prev,
            raceSettings
        }));
    }, [raceSettings]);

    // Handle input changes for TextField
    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value, type } = e.target;

        let processedValue: any = value;
        if (type === "number") {
            processedValue = value === "" ? undefined : parseFloat(value);
        }

        setFormData((prev) => ({
            ...prev,
            [name]: processedValue,
        }));

        if (errors[name]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    // Validate form
    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        // Required field validations
        if (!formData.title.trim()) {
            newErrors.name = "Event name is required";
        }

        if (!formData.distance || formData.distance <= 0) {
            newErrors.distance = "Distance is required";
        }

        if (!formData.startTime) {
            newErrors.startTime = "Start time is required";
        }

        if (!formData.endTime) {
            newErrors.endTime = "End time is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setApiError("");

        const isValid = validateForm();
        if (!isValid) {
            window.scrollTo({ top: 0, behavior: "smooth" });
            return;
        }

        setIsSubmitting(true);

        try {
            const { ...apiData } = formData;

            const requestPayload: CreateRaceRequest = {
                title: apiData.title,
                distance: apiData.distance,
                startTime: apiData.startTime,
                endTime: apiData.endTime,

                raceSettings: raceSettings
                    ? {
                        published: raceSettings.published || false,
                        sendSms: raceSettings.sendSms || false,
                        checkValidation: raceSettings.checkValidation || false,
                        showLeaderboard: raceSettings.showLeaderboard || false,
                        showResultTable: raceSettings.showResultTable || false,
                        isTimed: raceSettings.isTimed || false,
                        publichDnf: raceSettings.publichDnf || false,
                        dedUpSeconds: raceSettings.dedUpSeconds || 0,
                        lateStartCutOff: raceSettings.lateStartCutOff || 300,
                        earlyStartCutOff: raceSettings.earlyStartCutOff || 1200,
                        hasLoops: raceSettings.hasLoops || false,
                        loopLength: raceSettings.loopLength || 0,
                        dataHeaders: raceSettings.dataHeaders || "",
                    }
                    : {
                        published: false,
                        sendSms: false,
                        checkValidation: false,
                        showLeaderboard: false,
                        showResultTable: false,
                        isTimed: false,
                        publichDnf: false,
                        dedUpSeconds: 0,
                        lateStartCutOff: 300,
                        earlyStartCutOff: 1200,
                        hasLoops: false,
                        loopLength: 0,
                        dataHeaders: "",
                    }
            };

            // Update event
            const updatedEvent = await RaceService.updateRace(
                eventId!,
                id!,
                requestPayload as any
            );

            // Navigate back to event details page
            navigate(`/events/events-detail/${eventId}`);
        } catch (error: any) {
            let errorMessage = "Failed to update race. Please try again.";

            if (error.response) {
                if (error.response.data?.errors) {
                    setErrors(error.response.data.errors);
                    errorMessage = "Please fix the validation errors below.";
                } else if (error.response.data?.message) {
                    errorMessage = error.response.data.message;
                } else if (error.response.status === 401) {
                    errorMessage =
                        "Authentication failed. Please check if you are logged in and your token is valid.";
                } else if (error.response.status === 403) {
                    errorMessage = "You do not have permission to update races.";
                }
            } else if (error.request) {
                errorMessage =
                    "No response from server. Please check if the backend is running.";
            } else {
                errorMessage = error.message || errorMessage;
            }

            setApiError(errorMessage);
            window.scrollTo({ top: 0, behavior: "smooth" });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle cancel
    const handleCancel = () => {
        if (
            window.confirm(
                "Are you sure you want to cancel? All unsaved changes will be lost."
            )
        ) {
            navigate(`/events/events-detail/${eventId}`);
        }
    };

     return (<div></div>);
}