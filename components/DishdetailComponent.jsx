import React, { Component } from 'react';
import { Text, View, ScrollView, FlatList, Modal, StyleSheet, Button, Alert, PanResponder, Share } from 'react-native';
import { Card, Icon, Rating, Input } from 'react-native-elements';
import * as Animatable from 'react-native-animatable';

import { connect } from 'react-redux';
import { baseUrl } from '../shared/baseUrl';

import { postFavorite, postComment } from '../redux/ActionCreators';

const mapStateToProps = state => {
    return {
      dishes: state.dishes,
      comments: state.comments,
      favorites: state.favorites
    }
}

const mapDispatchToProps = dispatch => ({
    postFavorite: (dishId) => dispatch(postFavorite(dishId)),
    postComment: (dishId, rating, author, comment) =>
    dispatch(postComment(dishId, rating, author, comment))
});

function RenderComments(props) {

    const comments = props.comments;
            
    const renderCommentItem = ({item, index}) => {
        
        return (
            <View key={index} style={{margin: 10}}>
                <Text style={{fontSize: 14}}>{item.comment}</Text>
                <Text style={{fontSize: 12}}>{item.rating} Stars</Text>
                <Text style={{fontSize: 12}}>{'-- ' + item.author + ', ' + item.date} </Text>
            </View>
        );
    };
    
    return (
        <Animatable.View animation="fadeInUp" duration={2000} delay={1000}> 
            <Card title='Comments' >
            <FlatList 
                data={comments}
                renderItem={renderCommentItem}
                keyExtractor={item => item.id.toString()}
                />
            </Card>
        </Animatable.View>
    );
}

function RenderDish(props) {

    const dish = props.dish;

    handleViewRef = ref => this.view = ref;

    const recognizeDrag = ({ moveX, moveY, dx, dy }) => {
        if ( dx < -200 )
            return true;
        else if (dx > -200)
            return true;
        else
            return false;
    }

    const recognizeCommentDrag = ({ moveX, moveY, dx, dy }) => {
        if (dx > -200)
            return true;
        else
            return false;
    }

    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: (e, gestureState) => {
            return true;
        },

        onPanResponderGrant: () => {this.view.rubberBand(1000).then(endState => console.log(endState.finished ? 'finished' : 'cancelled'));},

        onPanResponderEnd: (e, gestureState) => {
            console.log("pan responder end", gestureState);
            if (recognizeDrag(gestureState) && !recognizeCommentDrag(gestureState)){
                Alert.alert(
                    'Add Favorite',
                    'Are you sure you wish to add ' + dish.name + ' to favorite?',
                    [
                    {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
                    {text: 'OK', onPress: () => {props.favorite ? console.log('Already favorite') : props.onPress()}},
                    ],
                    { cancelable: false }
                );
            }
            else if(recognizeDrag(gestureState) && recognizeCommentDrag(gestureState)){
                props.toggleModal()
            }                    
            return true;
        }
    })

    const shareDish = (title, message, url) => {
        Share.share({
            title: title,
            message: title + ': ' + message + ' ' + url,
            url: url
        },{
            dialogTitle: 'Share ' + title
        })
    }
    
    if (dish != null) {
        return(
            <Animatable.View 
                animation="fadeInDown" 
                duration={2000} 
                delay={1000}
                ref={this.handleViewRef}
                {...panResponder.panHandlers}
                >
                <Card
                featuredTitle={dish.name}
                image={{uri: baseUrl + dish.image}}>
                    <Text style={{margin: 10}}>
                        {dish.description}
                    </Text>
                    <View style={{ flex: 1, flexDirection: "row" }}> 
                        <Icon
                            raised
                            reverse
                            name={ props.favorite ? 'heart' : 'heart-o'}
                            type='font-awesome'
                            color='#f50'
                            onPress={() => props.favorite ? console.log('Already favorite') : props.onPress()}
                            />
                        <Icon
                            raised
                            reverse
                            name={"pencil"}
                            type='font-awesome'
                            color='#ADD8E6'
                            onPress={() => props.toggleModal()}
                            />
                        <Icon
                            raised
                            reverse
                            name='share'
                            type='font-awesome'
                            color='#51D2A8'
                            style={styles.cardItem}
                            onPress={() => shareDish(dish.name, dish.description, baseUrl + dish.image)} />
                    </View>

                </Card>
            </Animatable.View>
        );
    }
    else {
        return(<View></View>);
    }
}

class DishDetail extends Component {
    constructor(props) {
        super(props);
        this.state = {
          rating: 5,
          author: "",
          comment: "",
          showModal: false,
        };
    }

    markFavorite(dishId) {
        this.props.postFavorite(dishId);
    }

    toggleModal() {
        this.setState({ showModal: !this.state.showModal });
    }

    resetForm() {
        this.setState({
          rating: 5,
          author: "",
          comment: "",
          showModal: false,
        });
    }

    handleComment(dishId) {
        this.props.postComment(
            dishId,
            this.state.rating,
            this.state.author,
            this.state.comment
          );
          this.toggleModal();
          this.resetForm();
    }

    render() {
        const dishId = this.props.route.params.dishId;
        return(
            <ScrollView>
                <RenderDish dish={this.props.dishes.dishes[+dishId]}
                    favorite={this.props.favorites.some(el => el === dishId)}
                    onPress={() => this.markFavorite(dishId)} 
                    toggleModal={() => this.toggleModal()}
                    />
                <RenderComments comments={this.props.comments.comments.filter((comment) => comment.dishId === dishId)} />
                <Modal
                    animationType={"slide"}
                    transparent={false}
                    visible={this.state.showModal}
                    onDismiss={() => {
                        this.toggleModal();
                        this.resetForm();
                    }}
                    onRequestClose={() => {
                        this.toggleModal();
                        this.resetForm();
                    }}
                    >
                    <View style={styles.modal}>
                        <View style={{ marginTop: 50, marginBottom: 10 }}>
                        <Rating
                            type="star"
                            ratingCount={5}
                            fractions={1}
                            startingValue={5}
                            imageSize={20}
                            onFinishRating={(rating) => {
                            this.setState({ rating: rating });
                            }}
                            showRating
                            style={{ paddingVertical: 10 }}
                        />
                        </View>
                        <View style={{ margin: 10 }}>
                        <Input
                            placeholder="Author"
                            leftIcon={{ type: "font-awesome", name: "user-o" }}
                            size={24}
                            onChangeText={(text) => {
                            this.setState({ author: text });
                            }}
                        />
                        </View>
                        <View style={{ margin: 10 }}>
                        <Input
                            placeholder="Comment"
                            leftIcon={{ type: "font-awesome", name: "comment-o" }}
                            onChangeText={(text) => {
                            this.setState({ comment: text });
                            }}
                        />
                        </View>
                        <View style={{ margin: 10 }}>
                        <Button
                            onPress={() => {
                            this.handleComment(dishId);
                            this.resetForm();
                            }}
                            color="#512DA8"
                            title="Submit"
                        />
                        </View>
                        <View style={{ margin: 10 }}>
                        <Button
                            onPress={() => {
                            this.toggleModal();
                            this.resetForm();
                            }}
                            color="#333"
                            title="Cancel"
                        />
                        </View>
                    </View>
                </Modal>
            </ScrollView>
        );
    }
}

const styles = StyleSheet.create({
    modal: {
      justifyContent: "center",
      margin: 20,
    },
    modalTitle: {
      fontSize: 24,
      fontWeight: "bold",
      backgroundColor: "#512DA8",
      textAlign: "center",
      color: "white",
      marginBottom: 20,
    },
    modalText: {
      fontSize: 18,
      margin: 10,
    },
});

export default connect(mapStateToProps, mapDispatchToProps)(DishDetail);