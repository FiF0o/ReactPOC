/**
 * Created by jonlazarini on 12/06/16.
 */
import React from 'react'
import JQuery from 'jquery'

import CommentForm from './CommentForm'
import CommentAvatarList from './CommentAvatarList'
import Comment from './Comment'

export default class CommentBox extends React.Component {

    constructor() {
        super();

        this.state = {
            showComments: false,
            // will be use to store the array of comment from the API
            comments: []
        };

        /*
        pre-bind method to class scope which is CommentBox and can be
        passed around without having to use .bind(this) at prop level in
        the component below onDelete={}
        bind(this) binds the context to the instance of the class rather
        than the class itself...
        */
        this._deleteComment = this._deleteComment.bind(this)
        this._addComment = this._addComment.bind(this)
        this._toggleComments = this._toggleComments.bind(this)
    }
    /*
     lifecycle method is used as fetchComments calls render and it will be
     an infinite loop...
      */

    componentWillMount() {
        this._fetchComments();
    }
    /*
     Start polling process for AJAX request here and rerenders components
     every 5 secs
     Memory leak as the timer is created (setInterval()) everytime the page is
     rendered on
      he page
     */
    //TODO fix setInterval which removes comment every 1 min
    componentDidMount() {
        let fetch = this._fetchComments();
        this._timer = setInterval(() => fetch, 1000)
    }

    //destroys timer when about to be remove removed - no more memory leak
    componentWillUnmout() {
        clearInterval(this_.timer);
    }

    render() {
        const comments = this._getComments();
        return (
          <div className="row comments-container">
              <div className="cell">
                  <h2>Join The Discussion</h2>
                  <div className="comment-box">
                      <CommentForm addComment={this._addComment} />
                      <CommentAvatarList avatars={this._getAvatars()} />

                      {this._getPopularMessage(comments.length)}
                      <h3 className="comment-count">{this._getCommentsTitle(comments.length)}</h3>
                      <div className="comment-list">
                          <button className="button-secondary" onClick={this._toggleComments} >{this.state.showComments ? "Hide" +
                          " comment" : "Show comment"}</button>
                          {this.state.showComments ? <div className="comment-list">{comments}</div> : null}
                      </div>
                  </div>
              </div>
          </div>
        );
    }
    //TODO bind(this) at the constructor level to increase perf and not rely
    // on garbage collector to destroy objects when not used
    _toggleComments(e) {
        
        this.setState({showComments: !this.state.showComments})
        e.preventDefault();
    }

    _getAvatars() {
        return this.state.comments.map(comment => comment.avatarUrl);
    }

    _getPopularMessage(commentCount) {
        const POPULAR_COUNT = 10;
        if (commentCount > POPULAR_COUNT) {
            return (
                <div>This post is getting really popular, don't miss out!</div>
            );
        }
    }

    _getComments() {
        return this.state.comments.map((comment) => {
            /* spread operator to return comment.id, comment.author,
             comment.body, comment.avatarUrl etc..
             all comment properties */
            return <Comment
                {...comment}
                onDelete={this._deleteComment}
                key={comment.id}
            />
            // onDelete - declare this._deleteComment in constructor
        });
    }
    /**
     * server side
    */
     
     _deleteComment() {
        JQuery.ajax({
            method: 'DELETE',
            url:`/api/comments/${comment.id}`
        });
        /*
        * optimistic update
        * 1- create new array by copying elements of the state - clone array
        * 2- find Index of the comment to be deleted in the array
        * 3- delete at 1 comment at the position index
        * */
        const comments = [...this.state.comments];
        const commentIndex = comments.indexOf(comment);
        comments.splice(commentIndex, 1);
        this.setState({ comments });
    }

    _getCommentsTitle(commentCount) {
        if (commentCount === 0) {
            return 'No comments yet';
        } else if (commentCount === 1) {
            return '1 comment';
        } else {
            return `${commentCount} comments`;
        }
    }

    _addComment(commentAuthor, commentBody) {
        /*
        Method is passed down, propagated to the child componentCommentForm as we can pass function as argument - functions are
        first class citizen - onComment is a prop at the parent component
        level that will be passed down/called in the child component
        */
        const comment = {
            id: this.state.comments.length + 1,
            author: commentAuthor,
            body: commentBody,
            avatarUrl: 'assets/images/avatars/avatar-default.png'
        };
        /*
         Instead of push() which doesnt return the new array but only mutate
          it, we can also use concat()in the method
          setState({
            comments: this.state.concat([comment])
          })
         
          */
        this.state.comments.push(comment)
        var comments = this.state.comments
        this.setState({
            // Use concat instead of push as concat returns a reference to
            // the array instead of mutating the array
            comments
        });

      /**
       *  ADD COMMENT GENERATED ON SERVER SIDE (above is client side)
       * One way control flow example
       *
       *
       *  const comment= { author, body };
       *
       *  JQuery.post('/api/comments', { comment })
       *    .success(newComment => {
       *        this.setState({comments:
        *        this.state.comments.concat([newComment])});
       *    });
       */

    }

    _fetchComments() {
        JQuery.ajax({
            method: 'GET',
        //TODO Change final js file bundle.js to be dist at root level ./public
            //url: 'api/comment/comments.json',

            // Receives apiUrl prop from parent component: PicturePage,
            // BlogPage, etc..
            url: this.props.apiUrl,
            success: (comments) => {
                this.setState({ comments })
            }
        });
    }

    _deleteComment(commentID) {
        const comments = this.state.comments.filter(
            comment => comment.id !== commentID
        );
                    // NTM
        this.setState({ comments });
    }

}

CommentBox.propTypes = {
    // will define a prop as being mandatory to work
    // data is propagated from the CommentBox (parent) to the CommentForm
    // (child)
    apiUrl: React.PropTypes.string.isRequired
}

