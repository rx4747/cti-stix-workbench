import artifact from "./icons/stix2_artifact_icon_tiny_round_v1.png";
import attackPattern from "./icons/stix2_attack_pattern_icon_tiny_round_v1.png";
import autonomousSystem from "./icons/stix2_autonomous_system_icon_tiny_round_v1.png";
import bundle from "./icons/stix2_bundle_icon_tiny_round_v1.png";
import campaign from "./icons/stix2_campaign_icon_tiny_round_v1.png";
import courseOfAction from "./icons/stix2_course_of_action_icon_tiny_round_v1.png";
import customObject from "./icons/stix2_custom_object_icon_tiny_round_v1.svg";
import directory from "./icons/stix2_directory_icon_tiny_round_v1.png";
import domainName from "./icons/stix2_domain_name_icon_tiny_round_v1.png";
import emailAddress from "./icons/stix2_email_addr_icon_tiny_round_v1.png";
import emailMessage from "./icons/stix2_email_message_icon_tiny_round_v1.png";
import file from "./icons/stix2_file_icon_tiny_round_v1.png";
import grouping from "./icons/stix2_grouping_icon_tiny_round_v1.png";
import identity from "./icons/stix2_identity_icon_tiny_round_v1.png";
import incident from "./icons/stix2_incident_icon_tiny_round_v1.png";
import indicator from "./icons/stix2_indicator_icon_tiny_round_v1.png";
import infrastructure from "./icons/stix2_infrastructure_icon_tiny_round_v1.png";
import intrusionSet from "./icons/stix2_intrusion_set_icon_tiny_round_v1.png";
import ipv4Address from "./icons/stix2_ipv4_addr_icon_tiny_round_v1.png";
import ipv6Address from "./icons/stix2_ipv6_addr_icon_tiny_round_v1.png";
import languageContent from "./icons/stix2_language_icon_tiny_round_v1.png";
import location from "./icons/stix2_location_icon_tiny_round_v1.png";
import macAddress from "./icons/stix2_mac_addr_icon_tiny_round_v1.png";
import malwareAnalysis from "./icons/stix2_malware_analysis_icon_tiny_round_v1.png";
import malware from "./icons/stix2_malware_icon_tiny_round_v1.png";
import markingDefinition from "./icons/stix2_marking_definition_icon_tiny_round_v1.png";
import mutex from "./icons/stix2_mutex_icon_tiny_round_v1.png";
import networkTraffic from "./icons/stix2_network_traffic_icon_tiny_round_v1.png";
import note from "./icons/stix2_note_icon_tiny_round_v1.png";
import observedData from "./icons/stix2_observed_data_icon_tiny_round_v1.png";
import opinion from "./icons/stix2_opinion_icon_tiny_round_v1.png";
import process from "./icons/stix2_process_icon_tiny_round_v1.png";
import relationship from "./icons/stix2_relationship_icon_tiny_round_v1.png";
import report from "./icons/stix2_report_icon_tiny_round_v1.png";
import sighting from "./icons/stix2_sighting_icon_tiny_round_v1.png";
import software from "./icons/stix2_software_icon_tiny_round_v1.png";
import threatActor from "./icons/stix2_threat_actor_icon_tiny_round_v1.png";
import tool from "./icons/stix2_tool_icon_tiny_round_v1.png";
import url from "./icons/stix2_url_icon_tiny_round_v1.png";
import userAccount from "./icons/stix2_user_account_icon_tiny_round_v1.png";
import vulnerability from "./icons/stix2_vulnerability_icon_tiny_round_v1.png";
import windowsRegistryKey from "./icons/stix2_windows_registry_key_icon_tiny_round_v1.png";
import x509Certificate from "./icons/stix2_x509_certificate_icon_tiny_round_v1.png";

const iconByType: Readonly<Record<string, string>> = Object.freeze({
  artifact: artifact,
  "attack-pattern": attackPattern,
  "autonomous-system": autonomousSystem,
  bundle: bundle,
  campaign: campaign,
  "course-of-action": courseOfAction,
  directory: directory,
  "domain-name": domainName,
  "email-addr": emailAddress,
  "email-message": emailMessage,
  "extension-definition": customObject,
  file: file,
  grouping: grouping,
  identity: identity,
  incident: incident,
  indicator: indicator,
  infrastructure: infrastructure,
  "intrusion-set": intrusionSet,
  "ipv4-addr": ipv4Address,
  "ipv6-addr": ipv6Address,
  "language-content": languageContent,
  location: location,
  "mac-addr": macAddress,
  malware: malware,
  "malware-analysis": malwareAnalysis,
  "marking-definition": markingDefinition,
  mutex: mutex,
  "network-traffic": networkTraffic,
  note: note,
  "observed-data": observedData,
  opinion: opinion,
  process: process,
  relationship: relationship,
  report: report,
  sighting: sighting,
  software: software,
  "threat-actor": threatActor,
  tool: tool,
  url: url,
  "user-account": userAccount,
  vulnerability: vulnerability,
  "windows-registry-key": windowsRegistryKey,
  "x509-certificate": x509Certificate,
});

export function stixIconDataUrl(type: string): string {
  return Object.hasOwn(iconByType, type)
    ? (iconByType[type] ?? customObject)
    : customObject;
}
