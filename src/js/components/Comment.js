/**
 * Created by jonlazarini on 12/06/16.
 */
import React from 'react'

import CommentConfirmation from './CommentConfirmation'


export default class Comment extends React.Component {
  constructor() {
    super();

    this.state = {
      isAbusive: false
    };
    this._handleDelete = this._handleDelete.bind(this)
    this._toggleAbuse = this._toggleAbuse.bind(this)
  }

  render() {

    let commentBody;

    if (!this.state.isAbusive) {
      commentBody = this.props.body;
    } else {
      commentBody = <em>Content marked as abusive</em>;
    }

    return(
      <div className="comment">

        <img src={this.props.avatarUrl} alt={`${this.props.author}'s picture`} />

        <p className="comment-header">{this.props.author}</p>
        <p className="comment-body">{commentBody}</p>
        <div className="comment-actions">
          <CommentConfirmation onDelete={this._handleDelete} />
          <a href="#" onClick={this._toggleAbuse}>Report as Abuse</a>
        </div>
      </div>
    );
  }
  //TODO Fix toggle abuse to have Yes No text displayed and pop up onDelete

  _toggleAbuse(event) {
    event.preventDefault();

    this.setState({
      isAbusive: !this.state.isAbusive
    });
  }

  _handleDelete() {
    //event.preventDefault();
    //calls pop-up to confirm delete
    //TODO Move to report as abuse button
    if (confirm('Are you sure?')) {
      //passing down function form parent to comment by calling the onDelete prop
      //assigning the comment from the parent as parameter of the function to
      // the child component
      this.props.onDelete(this.props.comment);
      //this.props.onDelete(this.props.id);
    }
  }
}
