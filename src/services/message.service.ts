import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';
import SavedReply from '../models/SavedReply.js';
import Booking from '../models/Booking.js';

// Get or create conversation
export const getOrCreateConversation = async (
  userId: string,
  otherUserId: string,
  listingId: string,
  bookingId?: string
) => {
  // Check if conversation exists
  let conversation = await Conversation.findOne({
    participants: { $all: [userId, otherUserId] },
    listing: listingId
  }).populate('participants', 'name photo')
    .populate('listing', 'title images');

  if (!conversation) {
    // Create new conversation
    conversation = await Conversation.create({
      participants: [userId, otherUserId],
      listing: listingId,
      booking: bookingId,
      unreadCount: new Map([
        [userId, 0],
        [otherUserId, 0]
      ])
    });

    conversation = await conversation.populate('participants', 'name photo');
    conversation = await conversation.populate('listing', 'title images');
  }

  return conversation;
};

// Send message
export const sendMessage = async (
  conversationId: string,
  senderId: string,
  recipientId: string,
  content: string,
  messageType: 'text' | 'automated' | 'system' = 'text'
) => {
  // Create message
  const message = await Message.create({
    conversation: conversationId,
    sender: senderId,
    recipient: recipientId,
    content,
    messageType
  });

  // Update conversation
  const conversation = await Conversation.findById(conversationId);
  if (conversation) {
    conversation.lastMessage = content;
    conversation.lastMessageAt = new Date();
    
    // Increment unread count for recipient
    const currentCount = conversation.unreadCount.get(recipientId) || 0;
    conversation.unreadCount.set(recipientId, currentCount + 1);
    
    await conversation.save();
  }

  return message;
};

// Get conversation messages
export const getConversationMessages = async (
  conversationId: string,
  userId: string,
  page: number = 1,
  limit: number = 50
) => {
  // Verify user is participant
  const conversation = await Conversation.findOne({
    _id: conversationId,
    participants: userId
  });

  if (!conversation) {
    throw new Error('Conversation not found or unauthorized');
  }

  const skip = (page - 1) * limit;

  const messages = await Message.find({ conversation: conversationId })
    .sort('-createdAt')
    .skip(skip)
    .limit(limit)
    .populate('sender', 'name photo');

  return messages.reverse(); // Return in chronological order
};

// Mark messages as read
export const markMessagesAsRead = async (conversationId: string, userId: string) => {
  // Update all unread messages
  await Message.updateMany(
    {
      conversation: conversationId,
      recipient: userId,
      isRead: false
    },
    {
      isRead: true,
      readAt: new Date()
    }
  );

  // Reset unread count
  const conversation = await Conversation.findById(conversationId);
  if (conversation) {
    conversation.unreadCount.set(userId, 0);
    await conversation.save();
  }
};

// Get user's conversations
export const getUserConversations = async (userId: string) => {
  const conversations = await Conversation.find({
    participants: userId
  })
    .sort('-lastMessageAt')
    .populate('participants', 'name photo')
    .populate('listing', 'title images');

  return conversations.map(conv => {
    const otherParticipant = conv.participants.find(
      (p: any) => p._id.toString() !== userId
    );

    return {
      _id: conv._id,
      otherUser: otherParticipant,
      listing: conv.listing,
      lastMessage: conv.lastMessage,
      lastMessageAt: conv.lastMessageAt,
      unreadCount: conv.unreadCount.get(userId) || 0,
      createdAt: conv.createdAt
    };
  });
};

// Send automated message
export const sendAutomatedMessage = async (
  bookingId: string,
  messageType: 'booking-confirmed' | 'check-in-instructions' | 'check-out-reminder'
) => {
  const booking = await Booking.findById(bookingId)
    .populate('listing')
    .populate('host')
    .populate('user');

  if (!booking) {
    throw new Error('Booking not found');
  }

  let content = '';
  const listing = booking.listing as any;
  const host = booking.host as any;

  switch (messageType) {
    case 'booking-confirmed':
      content = `Your booking at ${listing.title} has been confirmed! Check-in: ${booking.startDate.toLocaleDateString()}, Check-out: ${booking.endDate.toLocaleDateString()}. Your host ${host.name} will send you check-in instructions soon.`;
      break;
    case 'check-in-instructions':
      content = `Welcome! Your check-in is tomorrow at ${listing.title}. Address: ${listing.address.street}, ${listing.address.city}. Please contact your host ${host.name} for access details.`;
      break;
    case 'check-out-reminder':
      content = `Thank you for staying at ${listing.title}! Check-out is tomorrow. Please ensure all house rules are followed and the property is left in good condition.`;
      break;
  }

  // Get or create conversation
  const conversation = await getOrCreateConversation(
    booking.host._id.toString(),
    booking.user._id.toString(),
    booking.listing._id.toString(),
    bookingId
  );

  // Send automated message
  return await sendMessage(
    conversation._id.toString(),
    booking.host._id.toString(),
    booking.user._id.toString(),
    content,
    'automated'
  );
};

// Saved Replies Management
export const createSavedReply = async (hostId: string, replyData: {
  title: string;
  content: string;
  category?: string;
}) => {
  return await SavedReply.create({
    host: hostId,
    ...replyData
  });
};

export const getSavedReplies = async (hostId: string) => {
  return await SavedReply.find({ host: hostId }).sort('-createdAt');
};

export const updateSavedReply = async (replyId: string, hostId: string, updateData: any) => {
  const reply = await SavedReply.findOne({ _id: replyId, host: hostId });
  
  if (!reply) {
    throw new Error('Saved reply not found or unauthorized');
  }

  Object.assign(reply, updateData);
  await reply.save();

  return reply;
};

export const deleteSavedReply = async (replyId: string, hostId: string) => {
  const reply = await SavedReply.findOneAndDelete({ _id: replyId, host: hostId });
  
  if (!reply) {
    throw new Error('Saved reply not found or unauthorized');
  }

  return reply;
};
