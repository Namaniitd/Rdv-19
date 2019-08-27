/**
 * Sunil and Manish
 */
/* Types are -
    1) event
    2) fest
    3) budget
    4) perms  :- permissions
*/

function getDefault(role, department="") {
  switch (role) {
    case 'BRCA General Secretary':
      return {
        can_manage_all_event: true,
        can_manage_all_fest: true,
        can_manage_all_budget: true,
        can_update_perms: true,
      };
    case 'Executive Team Member':
      return {
        can_manage_all_event: true,
        can_manage_all_fest: true,
        can_create_budget_request: true,
      };
    case 'Overall Coordinator':
      let perms_oc = {
        can_add_achead: true,
        can_create_budget_request: true,
      };
      if (department.toLowerCase().indexOf("brca events") !== -1) {
        perms_oc.can_manage_all_event = true;
        perms_oc.can_manage_venues = true;
        perms_oc.can_manage_event_categories = true;
      }
      return perms_oc;
    case 'Coordinator':
      let perms_c = {
        can_add_achead: true,
        can_create_budget_request: true,
      };
      if (department.toLowerCase().indexOf("events") !== -1) {
        perms_c.can_manage_event_general = true;
        perms_c.can_manage_event_pronite = true;
        perms_c.can_manage_event_informal = true;
      }
      else if (department.toLowerCase().indexOf("finance") !== -1) {
        perms_c.can_manage_venues = true;
        perms_c.can_manage_all_budget = true;
      }
      else if (department.toLowerCase().indexOf("marketing") !== -1) {
        perms_c.can_add_sponsor = true;
      }
      else if (department.toLowerCase().indexOf("social") !== -1) {
        perms_c.can_manage_event_social = true;
      }
      else if (department.toLowerCase().indexOf("international") !== -1) {
        perms_c.can_manage_event_international = true;
      }
      return perms_c;
      break;
    default: return {}
  }
}

module.exports = {
  getDefault: getDefault,
};
