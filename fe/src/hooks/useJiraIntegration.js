import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useIntegrationStore } from "@/store/integrationStore";

export function useJiraIntegration() {
  const { user } = useAuth();
  const { jira, fetchJiraStatus, connectJira, disconnectJira } =
    useIntegrationStore();

  const [jiraForm, setJiraForm] = useState({
    subdomain: "",
    email: "",
    apiToken: "",
  });

  useEffect(() => {
    if (user) {
      fetchJiraStatus();
    }
  }, [user, fetchJiraStatus]);

  useEffect(() => {
    if (!jira.connected && !jira.subdomain && !jira.email) return;

    setJiraForm((current) => ({
      ...current,
      subdomain: jira.subdomain || current.subdomain,
      email: jira.email || current.email,
      apiToken: "",
    }));
  }, [jira.connected, jira.email, jira.subdomain]);

  const handleJiraSave = async () => {
    await connectJira(jiraForm);
    setJiraForm((current) => ({ ...current, apiToken: "" }));
  };

  const handleJiraTest = async () => {
    await connectJira(jiraForm);
    setJiraForm((current) => ({ ...current, apiToken: "" }));
  };

  const handleJiraDisconnect = async () => {
    await disconnectJira();
    setJiraForm({ subdomain: "", email: "", apiToken: "" });
  };

  return {
    jiraForm,
    setJiraForm,
    jira,
    error: jira.error || "",
    handleJiraSave,
    handleJiraTest,
    handleJiraDisconnect,
  };
}
