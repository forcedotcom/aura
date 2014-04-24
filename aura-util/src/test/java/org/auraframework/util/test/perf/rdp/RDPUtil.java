package org.auraframework.util.test.perf.rdp;

import java.util.List;

import com.google.common.collect.Lists;

public final class RDPUtil {

    public static boolean containsMethod(List<RDPNotification> notifications, String method) {
        for (RDPNotification notification : notifications) {
            if (notification.getMethod().equals(method)) {
                return true;
            }
        }
        return false;
    }

    /**
     * @return the notifications for a given domain (i.e. Network/Timeline/...)
     */
    public static List<RDPNotification> filterNotifications(List<RDPNotification> notifications, RDP.Domain domain) {
        List<RDPNotification> domainNotifications = Lists.newArrayList();
        for (RDPNotification notification : notifications) {
            if (domain.equals(notification.getDomain())) {
                domainNotifications.add(notification);
            }
        }
        return domainNotifications;
    }
}
